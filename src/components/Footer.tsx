import type { FC } from "react"
import { TRACKS, type TrackId } from "@/data/resume"

/**
 * The closing argument. Everything above it is a claim; this is the instruction
 * for checking one, which is the only thing that makes the claims worth reading.
 */
export const Footer: FC<{ track: TrackId }> = ({ track }) => {
    const copy = TRACKS[track]

    return (
        <footer className="px-5 pt-6 pb-16">
            <div className="mx-auto max-w-6xl">
                <div data-reveal className="rounded-2xl border border-accent-500/25 bg-gradient-to-b from-accent-500/10 to-transparent p-8 sm:p-10">
                    <h2 className="max-w-2xl text-2xl leading-snug text-white sm:text-3xl">Don’t take any of this on faith.</h2>
                    <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-400">
                        Every figure above names its source, the dashboard runs the real code with a sample account already seeded, and the audit
                        reports are published in full. Pick whichever claim you doubt most and follow it — that is the point of the page.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <a
                            href={copy.primaryCta.href}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full bg-gradient-to-b from-accent-300 to-accent-500 px-6 py-3 text-sm font-semibold text-ink-950 transition-transform hover:scale-[1.02] active:scale-[0.99]"
                        >
                            {copy.primaryCta.label}
                        </a>
                        <a
                            href={copy.resume.href}
                            className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-slate-200 transition-colors hover:border-accent-500/60 hover:text-white"
                        >
                            {copy.resume.label}
                        </a>
                    </div>
                </div>

                <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-6 font-mono text-[11px] text-slate-500">
                    <p>Lau Lok Jing · Kuala Lumpur, Malaysia</p>
                    <p>React 19 · Vite · Tailwind CSS 4 · GSAP — self-hosted fonts, no third-party origins.</p>
                </div>
            </div>
        </footer>
    )
}
