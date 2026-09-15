import type { TrackId } from "./resume"
import type { AmbientParams } from "@/lib/ambient"

/**
 * Fixed seed: every visitor gets the same nine-venue constellation, so the page has
 * a consistent look rather than a new arrangement on each load.
 */
export const AMBIENT_SEED = 0x9e3779b9

/**
 * The background reads the same lens as the content, so switching track changes the
 * atmosphere and not just the words.
 *
 * The `dev` lens moves data around the mesh; the `security` lens slows almost to a
 * stop and sends a single scanning band across it instead. Both use the same nine
 * nodes, because the point is that it is the same system seen two ways.
 */
export const AMBIENT_BY_TRACK: Record<TrackId, AmbientParams> = {
    dev: { venueCount: 9, maxEdges: 16, maxPulses: 5, pulseSpeed: 0.22, sweep: false },
    security: { venueCount: 9, maxEdges: 16, maxPulses: 2, pulseSpeed: 0.1, sweep: true },
}
