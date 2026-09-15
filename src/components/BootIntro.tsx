import { useCallback, useEffect, useRef, useState, type FC } from "react"
import { BOOT_LINES } from "@/data/boot"
import { activeLineAt, buildTimeline, visibleAt } from "@/lib/typing"

const SESSION_KEY = "laulj:intro-seen"

/**
 * Once per session, not once ever. `sessionStorage` survives a reload — so F5 does not
 * replay it — but not a new visit, which is what you actually want: `localStorage`
 * would hide the intro from the one person most worth impressing, someone returning
 * for a second look.
 */
export const shouldShowIntro = (): boolean => {
    try {
        return window.sessionStorage.getItem(SESSION_KEY) !== "1"
    } catch {
        // Storage can throw in private mode; showing it is the harmless default.
        return true
    }
}

const rememberIntro = () => {
    try {
        window.sessionStorage.setItem(SESSION_KEY, "1")
    } catch {
        /* worst case it shows again */
    }
}

/**
 * The boot window.
 *
 * It is an overlay, not a gate: the real page has already rendered and painted
 * underneath, so nothing is withheld from the reader, the crawler or the metrics.
 * Anything that changes that — blocking paint, hiding the content, or refusing to be
 * dismissed — would turn a flourish into a toll.
 */
export const BootIntro: FC<{ onDone: () => void }> = ({ onDone }) => {
    const timeline = useRef(buildTimeline(BOOT_LINES)).current
    const [elapsed, setElapsed] = useState(0)
    const [leaving, setLeaving] = useState(false)
    const finished = useRef(false)

    // Marked seen on mount rather than on completion, so an interrupted intro does not
    // come back on the next reload.
    useEffect(rememberIntro, [])

    const finish = useCallback(() => {
        if (finished.current) return
        finished.current = true
        // Reveal the rest before fading, so skipping still shows what it was going to say.
        setElapsed(timeline.durationMs)
        setLeaving(true)
        window.setTimeout(onDone, 380)
    }, [onDone, timeline.durationMs])

    useEffect(() => {
        let frame = 0
        const started = performance.now()

        const tick = (now: number) => {
            const next = now - started
            setElapsed(next)
            if (next >= timeline.durationMs) {
                finish()
                return
            }
            frame = requestAnimationFrame(tick)
        }

        frame = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(frame)
    }, [timeline, finish])

    // Any input at all dismisses it. Deliberately not a focus trap and deliberately
    // not scroll-blocking: there is nothing here worth holding anyone hostage for.
    useEffect(() => {
        const skip = () => finish()
        window.addEventListener("keydown", skip)
        window.addEventListener("pointerdown", skip)
        window.addEventListener("wheel", skip, { passive: true })
        window.addEventListener("touchstart", skip, { passive: true })

        return () => {
            window.removeEventListener("keydown", skip)
            window.removeEventListener("pointerdown", skip)
            window.removeEventListener("wheel", skip)
            window.removeEventListener("touchstart", skip)
        }
    }, [finish])

    const visible = visibleAt(timeline, elapsed)
    const typing = activeLineAt(timeline, elapsed)

    return (
        <div
            // Hidden from assistive tech: the page behind is the real content and is
            // already readable, so announcing this would only get in the way.
            aria-hidden="true"
            className={`fixed inset-0 z-[60] flex items-center justify-center bg-ink-950/90 px-4 backdrop-blur-sm transition-opacity duration-300 ${
                leaving ? "opacity-0" : "opacity-100"
            }`}
        >
            <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-white/10 bg-[#0d1117] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]">
                <div className="flex items-center gap-2 border-b border-white/[0.08] bg-white/[0.03] px-4 py-2.5">
                    <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                    <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                    <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                    <span className="ml-3 truncate font-mono text-[11px] text-slate-450">laulj — zsh</span>
                </div>

                <div className="space-y-1 p-5 font-mono text-[12px] leading-relaxed sm:text-[13px]">
                    {timeline.appearances.map((appearance, index) => (
                        <div key={index} className="flex gap-3">
                            <span className="w-4 shrink-0 text-right text-slate-450 select-none">{index + 1}</span>
                            <span className="whitespace-pre text-slate-300">
                                {appearance.text.slice(0, visible[index])}
                                {index === typing && <span className="intro-caret" />}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <p className="absolute bottom-8 font-mono text-[11px] text-slate-450">any key to skip</p>
        </div>
    )
}
