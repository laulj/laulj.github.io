import { useState, type FC } from "react"
import { PROVENANCE_LABEL, type Metric } from "@/data/resume"

/**
 * A metric is only half the story; the other half is how a reader would check it.
 * The source is one click away rather than hidden in a footnote, because a claim
 * nobody can follow up on is indistinguishable from a made-up one.
 */
export const MetricCard: FC<{ metric: Metric }> = ({ metric }) => {
    const [open, setOpen] = useState(false)
    const { provenance, note } = metric

    return (
        <figure
            data-reveal
            className="flex flex-col rounded-xl border border-white/10 bg-ink-800/60 p-5 transition-colors hover:border-accent-500/40"
        >
            <div className="font-mono text-[2rem] leading-none tabular-nums text-accent-300">{metric.value}</div>
            <figcaption className="mt-2 text-sm text-slate-400">{metric.label}</figcaption>

            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="rounded-full border border-white/10 bg-ink-950/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-slate-400">
                    {PROVENANCE_LABEL[provenance.kind]}
                </span>
                <span className="font-mono text-[11px] text-slate-500">as of {metric.asOf}</span>
            </div>

            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-expanded={open}
                className="mt-3 self-start font-mono text-[11px] text-accent-400 transition-colors hover:text-accent-300"
            >
                {open ? "− hide source" : "+ how to check"}
            </button>

            {open && (
                <div className="mt-3 rounded-lg border border-white/5 bg-ink-950/70 p-3 text-xs leading-relaxed text-slate-400">
                    <p>{provenance.ref}</p>
                    {provenance.kind !== "local-bench" && provenance.url && (
                        <a
                            href={provenance.url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-block break-all text-accent-400 hover:underline"
                        >
                            {provenance.url}
                        </a>
                    )}
                    {note && <p className="mt-3 border-t border-white/5 pt-3 text-slate-500">{note}</p>}
                </div>
            )}
        </figure>
    )
}
