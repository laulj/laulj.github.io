/**
 * The boot intro's timing model, kept pure and free of the DOM.
 *
 * The first version typed one continuous character stream, and it read as a blur —
 * what makes a terminal legible is the *rhythm*, not the velocity. So every line now
 * has its own appearance: when it starts, how fast its characters land, and how long
 * the shell appears to think before printing anything.
 *
 * Two properties are worth being able to test:
 *
 *  - The reveal is **monotonic**. Given only elapsed time, no line can stall, start
 *    early, or double-type.
 *  - The intro has a **hard time budget**. A script that would overrun is compressed
 *    uniformly, so it keeps its rhythm and only loses its dawdle.
 */

export type LineKind = "command" | "output" | "verdict"

export interface BootLine {
    text: string
    kind: LineKind
    /** A figure this line quotes; asserted against the site's own data. */
    quotes?: string
    /** An extra beat before this line, on top of the previous line's pause. */
    pauseBeforeMs?: number
}

export interface Appearance {
    /** Index into the original lines. */
    line: number
    text: string
    startMs: number
    charMs: number
}

export interface BootTimeline {
    appearances: Appearance[]
    durationMs: number
    /** True when the cap had to compress the rhythm to fit. */
    compressed: boolean
}

/**
 * The rhythm, in one place — these four numbers are the whole feel of the intro.
 *
 * A command is typed deliberately, because it should look like someone at a keyboard.
 * Output lands quickly, because a shell prints results rather than typing them. And
 * the pauses are the actual point: the beat after a command is what tells a viewer
 * the command *did* something, which is precisely what the flat version lost.
 */
export const TIMING: Record<LineKind, { charMs: number; pauseAfterMs: number }> = {
    command: { charMs: 20, pauseAfterMs: 280 },
    output: { charMs: 6, pauseAfterMs: 200 },
    verdict: { charMs: 6, pauseAfterMs: 0 },
}

/** The promise: the intro is never on screen longer than this, whatever it types. */
export const INTRO_MAX_MS = 4200

export const buildTimeline = (lines: BootLine[]): BootTimeline => {
    const planned: Appearance[] = []
    let cursor = 0

    lines.forEach((line, index) => {
        const timing = TIMING[line.kind]
        // No pause after the last line: once it has landed there is nothing to wait for.
        const pauseAfter = index === lines.length - 1 ? 0 : timing.pauseAfterMs

        cursor += line.pauseBeforeMs ?? 0
        planned.push({ line: index, text: line.text, startMs: cursor, charMs: timing.charMs })
        cursor += line.text.length * timing.charMs + pauseAfter
    })

    const natural = Math.round(cursor)
    if (natural <= INTRO_MAX_MS) return { appearances: planned, durationMs: natural, compressed: false }

    // Compressed uniformly rather than by speeding the typing up on its own, so the
    // proportions between "typing" and "thinking" survive.
    const scale = INTRO_MAX_MS / natural
    return {
        appearances: planned.map((appearance) => ({
            ...appearance,
            startMs: appearance.startMs * scale,
            charMs: appearance.charMs * scale,
        })),
        durationMs: INTRO_MAX_MS,
        compressed: true,
    }
}

/** Characters visible per line after `elapsedMs`. */
export const visibleAt = (timeline: BootTimeline, elapsedMs: number): number[] =>
    timeline.appearances.map((appearance) => {
        const elapsed = elapsedMs - appearance.startMs
        if (elapsed <= 0) return 0
        return Math.min(appearance.text.length, Math.floor(elapsed / appearance.charMs))
    })

/**
 * The line the caret belongs on — the one being typed right now, or -1 when nothing
 * is. During the pause after a command that is exactly what a real shell shows: no
 * caret on a line that has already been submitted.
 */
export const activeLineAt = (timeline: BootTimeline, elapsedMs: number): number => {
    const visible = visibleAt(timeline, elapsedMs)
    let active = -1

    timeline.appearances.forEach((appearance, index) => {
        const started = elapsedMs >= appearance.startMs
        if (started && visible[index] < appearance.text.length) active = index
    })

    return active
}
