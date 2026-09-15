import type { FC } from "react"
import { TRACKS, type TrackId } from "@/data/resume"

const CONTACT = [
    { label: "GitHub", href: "https://github.com/laulj" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/laulj80/" },
    { label: "HackenProof", href: "https://hackenproof.com/hackers/laulj80" },
    { label: "Email", href: "mailto:lok.jing.lau.80@gmail.com" },
]

export const Hero: FC<{ track: TrackId }> = ({ track }) => {
    const copy = TRACKS[track]

    return (
        <section id="top" className="px-5 pt-32 pb-14 sm:pt-40">
            <div data-hero className="relative mx-auto max-w-6xl">
                <p data-reveal className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent-300">
                    {copy.eyebrow}
                </p>

                <h1 data-reveal className="mt-6 max-w-4xl text-4xl leading-[1.08] text-white sm:text-[3.4rem]">
                    {copy.headline} <span className="font-display italic text-accent-300">{copy.headlineAccent}</span>
                </h1>

                <p data-reveal className="mt-6 max-w-2xl text-base leading-relaxed text-slate-400">
                    {copy.blurb}
                </p>

                <div data-reveal className="mt-9 flex flex-wrap items-center gap-3">
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

                <p data-reveal className="mt-6 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[11px] text-slate-500">
                    {CONTACT.map((item) => (
                        <a key={item.label} href={item.href} target="_blank" rel="noreferrer" className="transition-colors hover:text-accent-400">
                            {item.label}
                        </a>
                    ))}
                </p>
            </div>
        </section>
    )
}
