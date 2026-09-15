import { describe, expect, it } from "vitest"
import { AMBIENT_BY_TRACK, AMBIENT_SEED } from "@/data/ambient"
import { buildEdges, createState, mulberry32, seedNodes, step } from "./ambient"

describe("the seeded layout", () => {
    it("is identical for the same seed and different for another", () => {
        expect(seedNodes(AMBIENT_SEED, 9)).toEqual(seedNodes(AMBIENT_SEED, 9))
        expect(seedNodes(AMBIENT_SEED, 9)).not.toEqual(seedNodes(AMBIENT_SEED + 1, 9))
    })

    it("keeps every node inside the viewport", () => {
        for (const node of seedNodes(AMBIENT_SEED, 9)) {
            expect(node.x).toBeGreaterThanOrEqual(0)
            expect(node.x).toBeLessThanOrEqual(1)
            expect(node.y).toBeGreaterThanOrEqual(0)
            expect(node.y).toBeLessThanOrEqual(1)
        }
    })

    it("keeps the mesh away from the centre, where the copy is", () => {
        // Nodes are pushed to either side, so nothing ever sits behind the headline.
        const centred = seedNodes(AMBIENT_SEED, 9).filter((node) => Math.abs(node.x - 0.5) < 0.18)
        expect(centred).toHaveLength(0)
    })

    it("draws one node per venue, because the count is a real number", () => {
        const { venueCount } = AMBIENT_BY_TRACK.dev
        expect(venueCount).toBe(9)
        expect(seedNodes(AMBIENT_SEED, venueCount)).toHaveLength(9)
    })
})

describe("the edges", () => {
    it("never joins a node to itself and never repeats a pair", () => {
        const edges = buildEdges(seedNodes(AMBIENT_SEED, 9), 16)
        const seen = new Set<string>()

        for (const edge of edges) {
            expect(edge.a).not.toBe(edge.b)
            expect(edge.a).toBeLessThan(edge.b)
            seen.add(`${edge.a}-${edge.b}`)
        }

        expect(edges.length).toBeGreaterThan(0)
        expect(seen.size).toBe(edges.length)
    })

    it("respects the cap", () => {
        expect(buildEdges(seedNodes(AMBIENT_SEED, 9), 6)).toHaveLength(6)
    })
})

describe("the pulses", () => {
    it("fills up to the cap and keeps every one on a real edge", () => {
        const state = createState(AMBIENT_SEED, AMBIENT_BY_TRACK.dev)
        const random = mulberry32(1)

        for (let i = 0; i < 60; i++) step(state, 1 / 60, random)

        expect(state.pulses).toHaveLength(AMBIENT_BY_TRACK.dev.maxPulses)
        for (const pulse of state.pulses) {
            expect(state.edges[pulse.edge]).toBeDefined()
            expect(pulse.t).toBeGreaterThanOrEqual(0)
            expect(pulse.t).toBeLessThan(1)
        }
    })

    it("never stacks two pulses on the same edge", () => {
        const state = createState(AMBIENT_SEED, AMBIENT_BY_TRACK.dev)
        const random = mulberry32(7)

        for (let i = 0; i < 200; i++) {
            step(state, 1 / 60, random)
            const used = state.pulses.map((pulse) => pulse.edge)
            expect(new Set(used).size).toBe(used.length)
        }
    })

    it("retires finished pulses instead of accumulating them", () => {
        const state = createState(AMBIENT_SEED, AMBIENT_BY_TRACK.dev)
        const random = mulberry32(3)

        for (let i = 0; i < 2000; i++) step(state, 1 / 60, random)

        expect(state.pulses.length).toBeGreaterThan(0)
        expect(state.pulses.length).toBeLessThanOrEqual(AMBIENT_BY_TRACK.dev.maxPulses)
    })
})

describe("the sweep belongs to the lens, not the code", () => {
    it("exists only where the lens asks for it", () => {
        expect(createState(AMBIENT_SEED, AMBIENT_BY_TRACK.security).sweep).not.toBeNull()
        expect(createState(AMBIENT_SEED, AMBIENT_BY_TRACK.dev).sweep).toBeNull()
    })

    it("wraps around so it keeps crawling", () => {
        const state = createState(AMBIENT_SEED, AMBIENT_BY_TRACK.security)
        const random = mulberry32(5)

        for (let i = 0; i < 4000; i++) step(state, 1 / 60, random)

        expect(state.sweep).toBeGreaterThan(-0.16)
        expect(state.sweep).toBeLessThanOrEqual(1.15)
    })
})
