import { useEffect, useRef, useState, type FC } from "react"
import { AMBIENT_BY_TRACK, AMBIENT_SEED } from "@/data/ambient"
import type { TrackId } from "@/data/resume"
import { createState, mulberry32, step } from "@/lib/ambient"

/**
 * Alpha ceilings. The mesh sits behind body copy, so restraint is a requirement
 * rather than a preference — these numbers are the difference between atmosphere
 * and a readability problem.
 */
const EDGE_ALPHA = 0.13
const SWEEP_ALPHA = 0.34
const SWEEP_WIDTH = 0.16
const PULSE_ALPHA = 0.5
const PULSE_TRAIL = 0.22
const NODE_ALPHA = 0.45
/** Beyond 2 the fill cost outruns the visible benefit for hairlines. */
const MAX_DPR = 2
/** A tab restored after minutes would otherwise jump every pulse to its end. */
const MAX_DT = 1 / 20
const MOBILE_WIDTH = 640

type RGB = [number, number, number]

const ACCENT_FALLBACK: RGB = [16, 185, 129]
const WARN_FALLBACK: RGB = [245, 158, 11]

/** Reads the palette back out of CSS so index.css stays the one place colours live. */
const toRgb = (value: string, fallback: RGB): RGB => {
    const match = value.trim().match(/^#([0-9a-f]{6})$/i)
    if (!match) return fallback
    const int = Number.parseInt(match[1], 16)
    return [(int >> 16) & 255, (int >> 8) & 255, int & 255]
}

const rgba = ([r, g, b]: RGB, alpha: number) => `rgba(${r}, ${g}, ${b}, ${alpha})`

interface AmbientFieldProps {
    track: TrackId
    reducedMotion: boolean
}

/**
 * The animated background: the atmosphere the project's front-end rules call for,
 * plus a portrait of what the software actually does.
 *
 * Nine nodes are nine real venues; pulses travelling the edges between them are the
 * ingest loop moving data; the security lens replaces that flow with a single band
 * scanning the perimeter. The orbs and grid stay in CSS because a blurred gradient
 * is nearly free as a composited layer and expensive to redraw on a canvas.
 */
export const AmbientField: FC<AmbientFieldProps> = ({ track, reducedMotion }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const glowRef = useRef<HTMLDivElement>(null)
    const [palette, setPalette] = useState<{ accent: RGB; warn: RGB } | null>(null)

    useEffect(() => {
        const styles = getComputedStyle(document.documentElement)
        setPalette({
            accent: toRgb(styles.getPropertyValue("--color-accent-500"), ACCENT_FALLBACK),
            warn: toRgb(styles.getPropertyValue("--color-warn-500"), WARN_FALLBACK),
        })
    }, [])

    // The cursor light the project's front-end rules ask for.
    //
    // Positioned directly, not tweened. The first version smoothed it with a 0.7s
    // ease, which reads as the light lagging behind the pointer — a very obvious kind
    // of wrong. Only the fade is transitioned, and that lives in CSS, so the hot path
    // is a single transform write and GSAP is not needed here at all.
    useEffect(() => {
        const glow = glowRef.current
        if (!glow || reducedMotion) return
        // Touch devices have no cursor, and the glow would sit at 0,0 forever.
        if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return

        const onMove = (event: PointerEvent) => {
            glow.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`
            glow.style.opacity = "1"
        }
        const onLeave = () => {
            glow.style.opacity = "0"
        }

        window.addEventListener("pointermove", onMove, { passive: true })
        document.addEventListener("mouseleave", onLeave)
        window.addEventListener("blur", onLeave)

        return () => {
            window.removeEventListener("pointermove", onMove)
            document.removeEventListener("mouseleave", onLeave)
            window.removeEventListener("blur", onLeave)
        }
    }, [reducedMotion])

    // The mesh. One rAF loop, stopped the moment the tab is hidden and never started
    // at all under reduced motion.
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas || !palette) return

        const context = canvas.getContext("2d")
        if (!context) return

        const random = mulberry32(AMBIENT_SEED)
        const state = createState(AMBIENT_SEED, AMBIENT_BY_TRACK[track])

        // Fewer edges on a phone: the same picture, less to draw and less to see.
        const visible = window.innerWidth < MOBILE_WIDTH ? state.edges.slice(0, Math.ceil(state.edges.length / 2)) : state.edges
        const visibleIndexes = new Set(visible.map((_, index) => index))

        let width = 0
        let height = 0
        let frame = 0

        const resize = () => {
            const rect = canvas.getBoundingClientRect()
            const dpr = Math.min(MAX_DPR, window.devicePixelRatio || 1)
            width = rect.width
            height = rect.height
            canvas.width = Math.max(1, Math.round(width * dpr))
            canvas.height = Math.max(1, Math.round(height * dpr))
            context.setTransform(dpr, 0, 0, dpr, 0, 0)
        }

        const draw = () => {
            context.clearRect(0, 0, width, height)
            if (width === 0 || height === 0) return

            // Edges first, so nodes and pulses sit on top of them.
            for (const edge of visible) {
                const from = state.nodes[edge.a]
                const to = state.nodes[edge.b]
                const middle = (from.x + to.x) / 2

                // The sweep brightens whatever it is passing over: the security lens
                // walking the perimeter rather than watching data flow.
                const band = state.sweep === null ? 0 : Math.max(0, 1 - Math.abs(middle - state.sweep) / SWEEP_WIDTH)

                context.strokeStyle = band > 0 ? rgba(palette.warn, SWEEP_ALPHA * band) : rgba(palette.accent, EDGE_ALPHA)
                context.lineWidth = band > 0 ? 1.2 : 1
                context.beginPath()
                context.moveTo(from.x * width, from.y * height)
                context.lineTo(to.x * width, to.y * height)
                context.stroke()
            }

            context.fillStyle = rgba(palette.accent, NODE_ALPHA)
            for (const node of state.nodes) {
                context.beginPath()
                context.arc(node.x * width, node.y * height, node.r, 0, Math.PI * 2)
                context.fill()
            }

            // A fading trail behind a bright head is what reads as direction.
            for (const pulse of state.pulses) {
                if (!visibleIndexes.has(pulse.edge)) continue
                const edge = state.edges[pulse.edge]
                if (!edge) continue

                const from = state.nodes[edge.a]
                const to = state.nodes[edge.b]
                const ax = from.x * width
                const ay = from.y * height
                const dx = to.x * width - ax
                const dy = to.y * height - ay
                const tail = Math.max(0, pulse.t - PULSE_TRAIL)

                context.strokeStyle = rgba(palette.accent, PULSE_ALPHA)
                context.lineWidth = 1.6
                context.beginPath()
                context.moveTo(ax + dx * tail, ay + dy * tail)
                context.lineTo(ax + dx * pulse.t, ay + dy * pulse.t)
                context.stroke()

                context.fillStyle = rgba(palette.accent, 0.85)
                context.beginPath()
                context.arc(ax + dx * pulse.t, ay + dy * pulse.t, 1.7, 0, Math.PI * 2)
                context.fill()
            }
        }

        resize()

        // Reduced motion gets exactly one frame: the atmosphere without the motion.
        if (reducedMotion) {
            draw()
            return
        }

        let previous = performance.now()
        const tick = (now: number) => {
            const dt = Math.min(MAX_DT, (now - previous) / 1000)
            previous = now
            step(state, dt, random)
            draw()
            frame = requestAnimationFrame(tick)
        }
        frame = requestAnimationFrame(tick)

        let resizeTimer = 0
        const onResize = () => {
            window.clearTimeout(resizeTimer)
            resizeTimer = window.setTimeout(() => {
                resize()
                draw()
            }, 150)
        }

        // Nothing should animate behind a tab nobody is looking at.
        const onVisibility = () => {
            if (document.hidden) {
                cancelAnimationFrame(frame)
                frame = 0
            } else if (frame === 0) {
                previous = performance.now()
                frame = requestAnimationFrame(tick)
            }
        }

        window.addEventListener("resize", onResize)
        document.addEventListener("visibilitychange", onVisibility)

        return () => {
            cancelAnimationFrame(frame)
            window.clearTimeout(resizeTimer)
            window.removeEventListener("resize", onResize)
            document.removeEventListener("visibilitychange", onVisibility)
        }
    }, [palette, track, reducedMotion])

    return (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
            <div className="ambient-grid absolute inset-0" />
            <div className="ambient-orb ambient-orb-a" />
            <div className="ambient-orb ambient-orb-b" />
            <canvas ref={canvasRef} className="ambient-mesh absolute inset-0 h-full w-full" />
            <div ref={glowRef} className="ambient-glow" />
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-ink-900" />
        </div>
    )
}
