import type { FC } from "react"
import { AUDITS } from "@/data/resume"

/**
 * A confidential engagement gets a badge saying so, rather than a severity it is
 * not permitted to state. Being unable to publish is normal in this work and reads
 * as such; a severity with nothing behind it would not.
 */
export const AuditTimeline: FC = () => (
    <ol className="space-y-8 border-l border-white/10 pl-6">
        {AUDITS.map((audit) => (
            <li key={audit.target} data-reveal className="relative">
                <span aria-hidden className="absolute top-2 -left-[1.78rem] h-2 w-2 rounded-full bg-accent-500 ring-4 ring-accent-500/15" />

                <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-[11px] tracking-[0.08em] text-accent-300">
                        {audit.when} · {audit.kind}
                    </span>
                    {audit.confidential && (
                        <span className="rounded-full border border-warn-500/40 bg-warn-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-warn-400">
                            reported privately
                        </span>
                    )}
                </div>

                <h3 className="mt-2 text-lg font-semibold text-white">{audit.target}</h3>
                {audit.targetNote && <p className="text-xs text-slate-500">{audit.targetNote}</p>}

                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-400">{audit.summary}</p>

                <dl className="mt-4 space-y-2">
                    {audit.findings.map((finding) => (
                        <div key={finding.label} className="flex flex-col gap-0.5 text-xs sm:flex-row sm:gap-3">
                            <dt className="w-24 shrink-0 font-mono uppercase tracking-[0.08em] text-slate-500">{finding.label}</dt>
                            <dd className="max-w-2xl leading-relaxed text-slate-400">{finding.detail}</dd>
                        </div>
                    ))}
                </dl>

                {audit.evidence && (
                    <a
                        href={audit.evidence.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-block font-mono text-[11px] text-accent-400 transition-colors hover:text-accent-300"
                    >
                        {audit.evidence.label} →
                    </a>
                )}
            </li>
        ))}
    </ol>
)
