/**
 * The animated background's simulation, deliberately free of the DOM.
 *
 * Two constraints shaped this file:
 *
 *  - It must be **deterministic**. A seeded PRNG means every visitor sees the same
 *    constellation instead of a fresh random one, so the page has a stable identity
 *    and a screenshot of it is reproducible.
 *  - It must be **testable**. There is no canvas here, so the motion can be unit
 *    tested — which matters on a site whose whole argument is that claims should be
 *    checkable. An animation is a claim about behaviour like anything else.
 *
 * Positions are normalised to 0..1 so a resize never has to re-seed the layout.
 */

export interface AmbientNode {
    x: number
    y: number
    /** Radius in CSS pixels at a device-pixel-ratio of 1. */
    r: number
}

export interface AmbientEdge {
    /** Indices into `nodes`, always `a < b` so a pair can be de-duplicated. */
    a: number
    b: number
}

export interface Pulse {
    /** Index into `edges`. */
    edge: number
    /** Progress along the edge, 0..1. */
    t: number
    /** Edges per second. */
    speed: number
    hue: "accent" | "warn"
}

export interface AmbientParams {
    /** Mirrors the real venue count, so the picture stays honest if it ever changes. */
    venueCount: number
    maxEdges: number
    maxPulses: number
    pulseSpeed: number
    /** The security lens walks the perimeter rather than watching data flow. */
    sweep: boolean
}

export interface AmbientState {
    nodes: AmbientNode[]
    edges: AmbientEdge[]
    pulses: Pulse[]
    /** 0..1 position of the scanning band, or null when the lens has no sweep. */
    sweep: number | null
    sweepSpeed: number
    params: AmbientParams
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

/** Mulberry32: four lines, no dependency, and plenty for a decorative layout. */
export const mulberry32 = (seed: number): (() => number) => {
    let state = seed >>> 0
    return () => {
        state = (state + 0x6d2b79f5) >>> 0
        let t = state
        t = Math.imul(t ^ (t >>> 15), t | 1)
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

/**
 * The layout is a design decision, not an accident: nodes are pushed out past 0.30
 * from the horizontal centre so the mesh never sits behind the copy, and they span
 * most of the viewport vertically so the group reads as a field rather than a
 * diagram. A regular ring was the obvious first idea and looked like placeholder
 * art, which is why every position is jittered hard.
 */
export const seedNodes = (seed: number, count: number): AmbientNode[] => {
    const random = mulberry32(seed)
    const nodes: AmbientNode[] = []

    for (let index = 0; index < count; index++) {
        const side = index % 2 === 0 ? -1 : 1
        const distance = 0.3 + random() * 0.2
        nodes.push({
            x: clamp(0.5 + side * distance + (random() - 0.5) * 0.14, 0.04, 0.96),
            y: clamp(0.12 + random() * 0.76, 0.06, 0.94),
            r: 1.6 + random() * 1.4,
        })
    }

    return nodes
}

/** Connects each node to its two nearest neighbours, de-duplicating the pairs. */
export const buildEdges = (nodes: AmbientNode[], maxEdges: number): AmbientEdge[] => {
    const seen = new Set<string>()
    const edges: AmbientEdge[] = []
    const distance = (from: AmbientNode, to: AmbientNode) => Math.hypot(from.x - to.x, from.y - to.y)

    nodes.forEach((node, index) => {
        const nearest = nodes
            .map((other, otherIndex) => ({ otherIndex, gap: distance(node, other) }))
            .filter((candidate) => candidate.otherIndex !== index)
            .sort((left, right) => left.gap - right.gap)
            .slice(0, 2)

        for (const { otherIndex } of nearest) {
            if (edges.length >= maxEdges) return
            const a = Math.min(index, otherIndex)
            const b = Math.max(index, otherIndex)
            const key = `${a}-${b}`
            if (seen.has(key)) continue
            seen.add(key)
            edges.push({ a, b })
        }
    })

    return edges
}

export const createState = (seed: number, params: AmbientParams): AmbientState => {
    const nodes = seedNodes(seed, params.venueCount)

    return {
        nodes,
        edges: buildEdges(nodes, params.maxEdges),
        pulses: [],
        sweep: params.sweep ? 0 : null,
        sweepSpeed: 0.045,
        params,
    }
}

/**
 * Spawns on a free edge. Starting at a random `t` matters: spawning everything at
 * zero would make the pulses march in visible lockstep, which reads as a bug.
 */
const spawn = (state: AmbientState, random: () => number): boolean => {
    const free = state.edges.map((_, index) => index).filter((index) => !state.pulses.some((pulse) => pulse.edge === index))
    if (free.length === 0) return false

    state.pulses.push({
        edge: free[Math.floor(random() * free.length)],
        t: random(),
        speed: state.params.pulseSpeed * (0.8 + random() * 0.4),
        hue: "accent",
    })

    return true
}

/**
 * Advances one frame.
 *
 * Mutates `state` in place: this runs ~60 times a second, and allocating a fresh
 * state every frame would be waste for no gain. Randomness is injected rather than
 * imported so tests can drive the whole thing deterministically.
 */
export const step = (state: AmbientState, dt: number, random: () => number): void => {
    for (let index = state.pulses.length - 1; index >= 0; index--) {
        const pulse = state.pulses[index]
        pulse.t += pulse.speed * dt
        if (pulse.t >= 1) state.pulses.splice(index, 1)
    }

    // The guard is load-bearing: `spawn` fails when every edge is occupied, and an
    // unguarded loop would then spin forever.
    let attempts = 0
    while (state.pulses.length < state.params.maxPulses && attempts < state.params.maxPulses) {
        attempts++
        if (!spawn(state, random)) break
    }

    if (state.sweep !== null) {
        state.sweep += state.sweepSpeed * dt
        // Overshoot both ends so the band enters and leaves off-screen cleanly.
        if (state.sweep > 1.15) state.sweep = -0.15
    }
}
