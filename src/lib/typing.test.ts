import { describe, expect, it } from "vitest"
import { BOOT_LINES } from "@/data/boot"
import { activeLineAt, buildTimeline, INTRO_MAX_MS, TIMING, visibleAt, type BootLine } from "./typing"

const timeline = buildTimeline(BOOT_LINES)
const endOf = (index: number) => {
    const appearance = timeline.appearances[index]
    return appearance.startMs + appearance.text.length * appearance.charMs
}

describe("the intro's time budget", () => {
    it("never exceeds the cap, however much it has to type", () => {
        expect(timeline.durationMs).toBeLessThanOrEqual(INTRO_MAX_MS)

        const sprawling: BootLine[] = Array.from({ length: 40 }, (_, index) => ({
            text: `echo line ${index} `.repeat(8),
            kind: "command",
        }))
        expect(buildTimeline(sprawling).durationMs).toBeLessThanOrEqual(INTRO_MAX_MS)
    })

    it("compresses rather than dropping anything when it has to", () => {
        const long: BootLine[] = Array.from({ length: 40 }, () => ({ text: "x".repeat(80), kind: "command" as const }))
        const result = buildTimeline(long)

        expect(result.compressed).toBe(true)
        // Every line survives the squeeze: nothing is dropped, clipped or reordered.
        expect(result.appearances).toHaveLength(long.length)
        for (const [index, appearance] of result.appearances.entries()) {
            expect(appearance.text).toBe(long[index].text)
        }
    })
})

describe("the shell rhythm — the reason this exists", () => {
    it("leaves a beat between a command finishing and its output landing", () => {
        // Without this gap the whole thing reads as a blur, which is exactly what the
        // first, flat version did.
        expect(timeline.appearances[1].startMs - endOf(0)).toBeCloseTo(TIMING.command.pauseAfterMs, 0)
        expect(timeline.appearances[3].startMs - endOf(2)).toBeCloseTo(TIMING.command.pauseAfterMs, 0)
    })

    it("types a command more slowly than it prints its output", () => {
        const command = timeline.appearances.find((_, index) => BOOT_LINES[index].kind === "command")
        const output = timeline.appearances.find((_, index) => BOOT_LINES[index].kind === "output")

        expect(command?.charMs).toBeGreaterThan(output?.charMs ?? 0)
    })

    it("is slow enough to register, and still inside the budget", () => {
        expect(timeline.durationMs).toBeGreaterThan(2500)
        expect(timeline.durationMs).toBeLessThanOrEqual(INTRO_MAX_MS)
    })

    it("never has two lines typing at once", () => {
        for (let index = 1; index < timeline.appearances.length; index++) {
            expect(timeline.appearances[index].startMs).toBeGreaterThanOrEqual(endOf(index - 1))
        }
    })
})

describe("the reveal", () => {
    it("shows nothing at zero and everything at the end", () => {
        expect(visibleAt(timeline, 0).every((count) => count === 0)).toBe(true)
        expect(visibleAt(timeline, timeline.durationMs)).toEqual(timeline.appearances.map((a) => a.text.length))
    })

    it("only ever moves forwards", () => {
        let previous = visibleAt(timeline, 0)

        for (let elapsed = 0; elapsed <= timeline.durationMs; elapsed += 20) {
            const visible = visibleAt(timeline, elapsed)
            visible.forEach((count, index) => expect(count).toBeGreaterThanOrEqual(previous[index]))
            previous = visible
        }
    })

    it("clamps instead of over-revealing", () => {
        expect(visibleAt(timeline, timeline.durationMs * 10)).toEqual(timeline.appearances.map((a) => a.text.length))
    })
})

describe("the caret", () => {
    it("sits on the line being typed", () => {
        expect(activeLineAt(timeline, 10)).toBe(0)
    })

    it("disappears while the shell is executing, like a real prompt", () => {
        // Mid-pause: the command has been submitted and its output has not started.
        expect(activeLineAt(timeline, endOf(0) + TIMING.command.pauseAfterMs / 2)).toBe(-1)
    })

    it("is gone once everything has landed", () => {
        expect(activeLineAt(timeline, timeline.durationMs)).toBe(-1)
    })
})
