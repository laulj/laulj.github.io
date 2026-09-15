import { lazy, Suspense, useEffect, useState, type ReactNode } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import { AuditTimeline } from "@/components/AuditTimeline"
import { BootIntro, shouldShowIntro } from "@/components/BootIntro"
import { Footer } from "@/components/Footer"
import { Hero } from "@/components/Hero"
import { MetricCard } from "@/components/MetricCard"
import { Nav } from "@/components/Nav"
import { ProjectGrid } from "@/components/ProjectGrid"
import { Section } from "@/components/Section"
import { Stack } from "@/components/Stack"
import { HERO_METRICS, type TrackId } from "@/data/resume"
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion"
import { useTrack } from "@/hooks/useTrack"

// ScrollTrigger needs registering once, at module scope. `useGSAP` is a hook
// rather than a plugin, so it must not be passed here.
gsap.registerPlugin(ScrollTrigger)

/**
 * The background is decoration, so it is split into its own chunk and mounted only
 * once the page is idle. That keeps it out of the first paint entirely, and means
 * the canvas code costs the initial bundle nothing.
 */
const AmbientField = lazy(() =>
    // Mapped to `default` here rather than adding a default export, so every
    // component in the project keeps exporting the same way.
    import("@/components/AmbientField").then((module) => ({
        default: module.AmbientField,
    })),
)

const useIdleMount = (): boolean => {
    const [ready, setReady] = useState(false)

    useEffect(() => {
        if (typeof window.requestIdleCallback === "function") {
            const handle = window.requestIdleCallback(() => setReady(true), {
                timeout: 2500,
            })
            return () => window.cancelIdleCallback(handle)
        }

        const timer = window.setTimeout(() => setReady(true), 400)
        return () => window.clearTimeout(timer)
    }, [])

    return ready
}

/**
 * Reading order per lens. The content is identical; what changes is which argument
 * a reader meets first — engineering evidence for a development role, the audit
 * record for a security one. One build serves both, so they cannot drift apart.
 */
const ORDER: Record<TrackId, string[]> = {
    dev: ["metrics", "work", "audits", "stack"],
    security: ["audits", "metrics", "work", "stack"],
}

const SECTIONS: Record<string, { title: string; lead?: string; render: (track: TrackId) => ReactNode }> = {
    metrics: {
        title: "Numbers you can check",
        lead: "Three claims, each with its source one click away and the date it was true. Nothing here needs to be taken on trust.",
        render: () => (
            <div className="grid gap-4 sm:grid-cols-3">
                {HERO_METRICS.map((metric) => (
                    <MetricCard key={metric.label} metric={metric} />
                ))}
            </div>
        ),
    },
    work: {
        title: "Selected work",
        lead: "Filtered to what is relevant to this lens — the same projects, foregrounded differently.",
        render: (track) => <ProjectGrid track={track} />,
    },
    audits: {
        title: "Audit record",
        lead: "What I reviewed, how, and what came out of it. Where an engagement is confidential, the page says so instead of inventing a severity.",
        render: () => <AuditTimeline />,
    },
    stack: {
        title: "Stack & credentials",
        lead: "The tools I have actually shipped with, and the qualifications behind them.",
        render: (track) => <Stack track={track} />,
    },
}

export const App = () => {
    const [track, setTrack] = useTrack()
    const reducedMotion = usePrefersReducedMotion()
    const ambientReady = useIdleMount()
    // Under reduced motion the intro is never rendered at all, rather than shortened.
    const [introDone, setIntroDone] = useState(() => reducedMotion || !shouldShowIntro())

    // Re-run on a lens change so newly mounted nodes are revealed too.
    useGSAP(
        () => {
            const reveals = gsap.utils.toArray<HTMLElement>("[data-reveal]")
            const heroItems = gsap.utils.toArray<HTMLElement>("[data-hero] > *")

            // Switching lens re-runs this effect. `gsap.from()` animates *to* whatever the
            // element's current value happens to be, so a half-finished or reverted tween
            // that left an element holding the value it was animating from (opacity 0, or a
            // 26px offset) gets read as the end state — and the tween then runs 0 to 0. That
            // is what made the headline vanish and the work grid drift out of alignment after
            // a few switches. Clearing inline styles up front and animating with explicit
            // from/to values makes this idempotent, whatever state it is handed.
            gsap.set([...reveals, ...heroItems], { clearProps: "all" })

            if (reducedMotion) return

            heroItems.forEach((element, index) => {
                gsap.fromTo(
                    element,
                    { y: 18, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.5,
                        delay: index * 0.06,
                        ease: "power2.out",
                        clearProps: "transform,opacity",
                    },
                )
            })

            reveals.forEach((element) => {
                gsap.fromTo(
                    element,
                    { y: 26, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.6,
                        ease: "power2.out",
                        clearProps: "transform,opacity",
                        scrollTrigger: { trigger: element, start: "top 90%", once: true },
                    },
                )
            })

            // The section order changes with the lens, so every trigger's start has to be
            // recomputed against the new layout.
            ScrollTrigger.refresh()
        },
        // revertOnUpdate tears the previous tweens and triggers down before rebuilding
        // them; without it each switch leaves the old set alive alongside the new one.
        { dependencies: [track, reducedMotion], revertOnUpdate: true },
    )

    return (
        <>
            {!introDone && <BootIntro onDone={() => setIntroDone(true)} />}

            {ambientReady && (
                <Suspense fallback={null}>
                    <AmbientField track={track} reducedMotion={reducedMotion} />
                </Suspense>
            )}

            <div className="relative z-10">
                <Nav track={track} onTrack={setTrack} />
                <main>
                    <Hero track={track} />
                    {ORDER[track].map((id) => (
                        <Section key={id} id={id} title={SECTIONS[id].title} lead={SECTIONS[id].lead}>
                            {SECTIONS[id].render(track)}
                        </Section>
                    ))}
                </main>
                <Footer track={track} />
            </div>
        </>
    )
}
