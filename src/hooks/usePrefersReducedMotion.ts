import { useEffect, useState } from "react"

const QUERY = "(prefers-reduced-motion: reduce)"

/**
 * Whether the reader has asked their OS for less motion.
 *
 * The GSAP timelines are skipped entirely when this is true — the page is fully
 * readable with no motion at all, not merely with imperceptible motion, because
 * the CSS `prefers-reduced-motion` block in index.css only shortens durations.
 */
export const usePrefersReducedMotion = (): boolean => {
    const [reduced, setReduced] = useState(() => window.matchMedia(QUERY).matches)

    useEffect(() => {
        const media = window.matchMedia(QUERY)
        const onChange = () => setReduced(media.matches)
        media.addEventListener("change", onChange)
        return () => media.removeEventListener("change", onChange)
    }, [])

    return reduced
}
