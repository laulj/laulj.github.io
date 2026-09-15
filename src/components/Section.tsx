import type { FC, ReactNode } from "react"

interface SectionProps {
    id: string
    title: string
    lead?: string
    /** Spacing overrides for the first section, whose rhythm differs from the rest. */
    className?: string
    children: ReactNode
}

export const Section: FC<SectionProps> = ({ id, title, lead, className = "", children }) => (
    // scroll-mt clears the fixed header when a nav link jumps here.
    <section id={id} className={`scroll-mt-24 px-5 py-14 sm:py-20 ${className}`}>
        <div className="mx-auto max-w-6xl">
            <h2
                data-reveal
                className="border-l-2 border-accent-500 pl-4 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400"
            >
                {title}
            </h2>
            {lead && (
                <p data-reveal className="mt-5 max-w-3xl text-lg leading-relaxed text-slate-300">
                    {lead}
                </p>
            )}
            <div className="mt-10">{children}</div>
        </div>
    </section>
)
