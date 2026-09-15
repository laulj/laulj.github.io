import type { FC } from "react"
import { PROJECTS, type Project } from "@/data/projects"
import type { TrackId } from "@/data/resume"

/**
 * Projects are filtered by lens rather than shown as one undifferentiated pile —
 * a reader hiring for one role should not have to work out which half applies.
 */
export const ProjectGrid: FC<{ track: TrackId }> = ({ track }) => {
    const isFeatured = (project: Project) => project.featured?.includes(track) ?? false
    const visible = PROJECTS.filter((project) => project.tracks.includes(track)).sort((a, b) => Number(isFeatured(b)) - Number(isFeatured(a)))

    return (
        <div className="grid gap-4 md:grid-cols-2">
            {visible.map((project) => (
                <article
                    key={project.name}
                    data-reveal
                    className="flex flex-col rounded-xl border border-white/10 bg-ink-800/50 p-6 transition-colors hover:border-accent-500/40"
                >
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                        {isFeatured(project) && <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-warn-400">featured</span>}
                    </div>

                    <p className="mt-3 text-sm leading-relaxed text-slate-400">{project.blurb}</p>

                    {project.proof && (
                        <p className="mt-4 border-l-2 border-accent-500/40 pl-3 font-mono text-[11px] leading-relaxed text-accent-300/90">
                            {project.proof}
                        </p>
                    )}

                    <div className="mt-5 flex flex-wrap gap-1.5">
                        {project.stack.map((item) => (
                            <span
                                key={item}
                                className="rounded border border-white/10 bg-ink-950/60 px-2 py-0.5 font-mono text-[10px] text-slate-400"
                            >
                                {item}
                            </span>
                        ))}
                    </div>

                    {/* mt-auto keeps the links on a shared baseline across cards of
                        differing text length. */}
                    <div className="mt-auto space-y-2 pt-6">
                        {project.links.map((link) => (
                            <div key={link.href}>
                                <a
                                    href={link.href}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-sm text-accent-400 transition-colors hover:text-accent-300"
                                >
                                    {link.label} →
                                </a>
                                {link.note && <p className="mt-1 text-[11px] text-slate-450">{link.note}</p>}
                            </div>
                        ))}
                    </div>
                </article>
            ))}
        </div>
    )
}
