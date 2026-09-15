import { describe, expect, it } from "vitest"
import { AUDITS, CREDENTIALS, HERO_METRICS, PENDING_METRICS, TRACKS } from "./resume"
import { PROJECTS } from "./projects"
import { BOOT_LINES } from "./boot"

/**
 * These are not tests of behaviour — the site has almost none. They are tests of
 * *claims*. The whole premise of the page is that a reader can check what it says,
 * so the failure mode worth guarding is a number quietly appearing without a
 * source, or a confidential engagement quietly acquiring a severity badge.
 */

describe("every rendered number is checkable", () => {
    it.each(HERO_METRICS)("$value carries a date and a source", (metric) => {
        expect(metric.asOf).toMatch(/^\d{4}-\d{2}$/)
        expect(metric.provenance.ref.trim().length).toBeGreaterThan(0)
    })

    it("names the rig behind a locally-measured number", () => {
        const benches = HERO_METRICS.filter((metric) => metric.provenance.kind === "local-bench")
        expect(benches.length).toBeGreaterThan(0)
        for (const metric of benches) {
            // "Measured locally" is worth nothing unless the machine is described.
            expect(metric.provenance.ref).toMatch(/Osmosis/)
        }
    })

    it("keeps unverifiable claims out of the rendered set", () => {
        const rendered = HERO_METRICS.map((metric) => metric.value)
        for (const pending of PENDING_METRICS) {
            expect(rendered).not.toContain(pending.value)
            // and they must not have been given a date to look legitimate either
            expect(pending.asOf).toBe("")
        }
    })
})

describe("the audit record", () => {
    it("states no severity for a confidential engagement", () => {
        const confidential = AUDITS.filter((audit) => audit.confidential)
        expect(confidential.length).toBeGreaterThan(0)
        for (const audit of confidential) {
            expect(JSON.stringify(audit)).not.toMatch(/\b(critical|high|medium|low)\b\s*(severity|severities)?|\b\d+\s+(critical|high|medium|low)\b/i)
        }
    })

    it("backs a non-confidential audit with a document", () => {
        for (const audit of AUDITS.filter((audit) => !audit.confidential)) {
            expect(audit.evidence?.url).toBeTruthy()
        }
    })
})

describe("the two lenses", () => {
    it("hands each lens a different resume", () => {
        const hrefs = Object.values(TRACKS).map((track) => track.resume.href)
        expect(new Set(hrefs).size).toBe(hrefs.length)
        for (const href of hrefs) expect(href).toMatch(/^\/[^/]+\.pdf$/)
    })

    it("only ever filters projects by a lens that exists", () => {
        const ids = Object.keys(TRACKS)
        for (const project of PROJECTS) {
            expect(project.tracks.length).toBeGreaterThan(0)
            for (const id of project.tracks) expect(ids).toContain(id)
        }
    })

    it("gives every credential an issuer and a date", () => {
        for (const credential of CREDENTIALS) {
            expect(credential.issuer.length).toBeGreaterThan(0)
            expect(credential.when.length).toBeGreaterThan(0)
        }
    })
})

describe("the boot intro", () => {
    /**
     * The intro types figures at the reader before the page has made its case, and it
     * does so with no visible source beside them. So the same rule as the metrics has
     * to hold here: if a figure stops being backed by the site's own data, this fails
     * rather than the intro confidently typing something no longer true.
     */
    it("only types figures the site can actually back", () => {
        const corpus = [
            ...HERO_METRICS.map((metric) => `${metric.value} ${metric.label}`),
            ...PROJECTS.map((project) => `${project.blurb} ${project.proof ?? ""}`),
            ...CREDENTIALS.map((credential) => `${credential.title} ${credential.issuer}`),
        ].join(" ")

        const quoting = BOOT_LINES.filter((line) => line.quotes)
        expect(quoting.length).toBeGreaterThan(0)

        for (const line of quoting) expect(corpus).toContain(line.quotes)
    })
})
