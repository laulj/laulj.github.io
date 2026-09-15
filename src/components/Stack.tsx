import type { FC } from "react"
import { CREDENTIALS, SKILLS, type TrackId } from "@/data/resume"

export const Stack: FC<{ track: TrackId }> = ({ track }) => (
    <div className="space-y-14">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {SKILLS[track].map((group) => (
                <div key={group.group} data-reveal>
                    <h3 className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent-300">{group.group}</h3>
                    <ul className="mt-4 space-y-1.5">
                        {group.items.map((item) => (
                            <li key={item} className="text-sm text-slate-400">
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>

        <div data-reveal>
            <h3 className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500">Credentials</h3>
            <ul className="mt-4 border-t border-white/5">
                {CREDENTIALS.map((credential) => (
                    <li key={credential.title} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-white/5 py-3.5">
                        <span className="text-sm text-slate-200">{credential.title}</span>
                        <span className="text-xs text-slate-500">
                            {credential.issuer} · {credential.when}
                        </span>
                        {credential.url && (
                            <a
                                href={credential.url}
                                target="_blank"
                                rel="noreferrer"
                                className="ml-auto font-mono text-[11px] text-accent-400 transition-colors hover:text-accent-300"
                            >
                                {credential.urlLabel ?? "verify"} →
                            </a>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    </div>
)
