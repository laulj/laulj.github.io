import { useEffect, useState, type FC } from "react"
import { TRACKS, type TrackId } from "@/data/resume"

const SECTIONS = [
    { id: "metrics", label: "Numbers" },
    { id: "work", label: "Work" },
    { id: "audits", label: "Audits" },
    { id: "stack", label: "Stack" },
]

const TRACK_ORDER: TrackId[] = ["dev", "security"]

interface NavProps {
    track: TrackId
    onTrack: (next: TrackId) => void
}

export const Nav: FC<NavProps> = ({ track, onTrack }) => {
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24)
        window.addEventListener("scroll", onScroll, { passive: true })
        onScroll()
        return () => window.removeEventListener("scroll", onScroll)
    }, [])

    return (
        <header
            className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${
                scrolled ? "border-white/10 bg-ink-900/85 backdrop-blur-md" : "border-transparent"
            }`}
        >
            <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3.5">
                <a href="#top" className="font-display text-xl tracking-tight text-white">
                    Lau Lok Jing
                </a>

                <ul className="order-3 flex w-full gap-5 text-sm text-slate-400 sm:order-none sm:w-auto">
                    {SECTIONS.map((section) => (
                        <li key={section.id}>
                            <a href={`#${section.id}`} className="transition-colors hover:text-accent-400">
                                {section.label}
                            </a>
                        </li>
                    ))}
                </ul>

                {/* The lens switcher. It is a pair of links in spirit, but they write
                    to the URL through the history API, so the page never reloads. */}
                <div className="ml-auto flex items-center rounded-full border border-white/10 bg-ink-850 p-0.5">
                    {TRACK_ORDER.map((id) => (
                        <button
                            key={id}
                            type="button"
                            onClick={() => onTrack(id)}
                            aria-pressed={track === id}
                            className={`rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors ${
                                track === id ? "bg-accent-500/15 text-accent-300" : "text-slate-500 hover:text-slate-300"
                            }`}
                        >
                            {TRACKS[id].label}
                        </button>
                    ))}
                </div>
            </nav>
        </header>
    )
}
