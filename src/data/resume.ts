/**
 * The site's single source of truth, kept deliberately boring and declarative.
 *
 * The rule this file exists to enforce: **no number is rendered without a stated
 * source and a date**. A portfolio that asks a reader to trust it is worth less
 * than one that tells them how to check. `provenance.test.ts` fails the build if
 * a shipped metric is missing either half.
 *
 * Four kinds of provenance are allowed, in descending order of strength:
 *
 *  - `code`        — derived from a public repository, at a known path.
 *  - `command`     — reproducible by running a documented command.
 *  - `publication` — a third party published it (IEEE, a public repo count).
 *  - `local-bench` — an operator measurement on a described machine. The weakest
 *                    kind, so the rig is always spelled out rather than implied.
 */

export type Provenance =
    | { kind: "code"; ref: string; url?: string }
    | { kind: "command"; ref: string; url?: string }
    | { kind: "publication"; ref: string; url: string }
    | { kind: "local-bench"; ref: string }

export interface Metric {
    /** Pre-formatted for display: the value is part of the claim. */
    value: string
    label: string
    /** When this was last true. Shown next to the number, never omitted. */
    asOf: string
    provenance: Provenance
    /** Any caveat a reader would otherwise have to discover for themselves. */
    note?: string
}

export const PROVENANCE_LABEL: Record<Provenance["kind"], string> = {
    code: "From source",
    command: "Reproducible",
    publication: "Published",
    "local-bench": "Measured locally",
}

// ── Shipped metrics ──────────────────────────────────────────────────────────

/** Rendered in the hero. Each one has to survive "how do I know that?". */
export const HERO_METRICS: Metric[] = [
    {
        value: "9",
        label: "venues integrated",
        asOf: "2026-09",
        provenance: {
            kind: "code",
            ref: "frontend/src/pages/landing/Landing.tsx:22 — VENUE_COUNT = VENUES.length (CEX + DEX)",
            url: "https://github.com/laulj/tradeops-nexus",
        },
    },
    {
        value: "~100 ms",
        label: "full ingest loop (query + writes)",
        asOf: "2026-09",
        provenance: {
            kind: "local-bench",
            ref: "one complete execution loop against a locally-run Osmosis pruned node with a sidecar SQS server",
        },
        note: "A development-rig figure, not a production SLA: it measures the ingest loop, not order latency. ~50 ms is reachable on the same rig.",
    },
    {
        value: "$44,682.15",
        label: "settled ledger, admin account",
        asOf: "2026-09",
        provenance: {
            kind: "command",
            ref: "spot 43,178.80 + spot-futures 1,520.56 + funding-rate −17.21, Nov 2023 – Sep 2026",
            url: "https://github.com/laulj/tradeops-nexus",
        },
        note: "A $117.89 residual is four spot-futures positions (ids 585–588) whose venue fill rows are not yet migrated. That is a data gap, not a calculation error, and it is left visible rather than rounded away.",
    },
]

// ── Audit record ─────────────────────────────────────────────────────────────

export interface Audit {
    when: string
    kind: string
    target: string
    /** What the target actually is, for a reader who has never heard of it. */
    targetNote?: string
    summary: string
    findings: { label: string; detail: string }[]
    /** A document the reader can open, rather than a claim they must accept. */
    evidence?: { label: string; url: string }
    /** Set when the engagement's terms bar public detail; shown as a badge. */
    confidential?: boolean
}

export const AUDITS: Audit[] = [
    {
        when: "2026",
        kind: "Independent audit",
        target: "Uniswap V3 Core + Periphery",
        summary:
            "Architectural review of concentrated liquidity: flash-loan reentrancy paths, multi-hop swap integrity, and the security trade-offs that gas-efficient designs force.",
        findings: [
            {
                label: "Scope",
                detail: "Core and periphery contracts, read as an adversary rather than an integrator",
            },
            {
                label: "Method",
                detail: "Manual review and diagram-led threat modelling, with Foundry used to reproduce any hypothesis before it was written down",
            },
        ],
        evidence: {
            label: "UniswapV3-Independent-Audit-Report.pdf",
            url: "https://github.com/laulj/audit-reports",
        },
    },
    {
        when: "2026",
        kind: "Competitive audit",
        target: "0xMarkets Protocol",
        targetNote: "FX and crypto perpetuals DEX on Bittensor",
        summary:
            "Precision-loss and state-handling review, reported privately to the team. The engagement's terms do not permit publishing the report, so the findings and their severities stay confidential — the absence of a severity badge here is deliberate, not an oversight.",
        findings: [
            {
                label: "Method",
                detail: "Slither, Foundry fuzzing, and manual review of the accounting and settlement paths",
            },
            {
                label: "Disclosure",
                detail: "Private report to the protocol; no severity breakdown published anywhere",
            },
        ],
        confidential: true,
    },
]

// ── Credentials ──────────────────────────────────────────────────────────────

export interface Credential {
    title: string
    issuer: string
    when: string
    /** A link a reader can open, as opposed to a claim they must take on faith. */
    url?: string
    urlLabel?: string
}

export const CREDENTIALS: Credential[] = [
    {
        title: "Solidity Smart Contract Developer & Auditor",
        issuer: "Cyfrin Updraft",
        when: "2025–2026",
        url: "https://github.com/laulj/audit-reports",
        urlLabel: "Course audit reports",
    },
    {
        title: "ACCR system — IEEE publication, 89.20% accuracy",
        issuer: "IEEE",
        when: "2024",
        url: "https://ieeexplore.ieee.org/document/10607358",
        urlLabel: "IEEE Xplore",
    },
    {
        title: "CS50's Web Programming with Python & JavaScript",
        issuer: "HarvardX",
        when: "2022–2023",
        url: "https://certificates.cs50.io/a6fe673a-4dd0-4ce3-97d7-6d6c16f582c5.pdf?size=A4",
        urlLabel: "Certificate",
    },
    {
        title: "CS50's Introduction to Computer Science",
        issuer: "HarvardX",
        when: "2023",
        url: "https://courses.edx.org/certificates/d3d6c984cc294d3b8efaa040aa16a39f",
        urlLabel: "Certificate",
    },
    {
        title: "B.Eng. Electrical & Electronics Engineering — GPA 3.65/4.0",
        issuer: "TARUMT",
        when: "2022",
        // TARUMT issues this as a blockchain-anchored certificate, so a reader can
        // verify it rather than take it on faith — the same principle as the metrics.
        url: "/EEBachelorDegCertificate.pdf",
        urlLabel: "Certificate (PDF)",
    },
]

// ── Skills, per track ────────────────────────────────────────────────────────

export const SKILLS: Record<TrackId, { group: string; items: string[] }[]> = {
    dev: [
        {
            group: "Languages",
            items: ["TypeScript", "JavaScript", "SQL", "Solidity", "Python", "Go"],
        },
        {
            group: "Frontend",
            items: ["React 19", "Vite", "Tailwind CSS 4", "GSAP", "Ant Design", "TanStack Query"],
        },
        {
            group: "Backend & data",
            items: ["Node.js", "Express", "SQLite (WAL)", "node-cache", "REST + WebSockets", "Vitest"],
        },
        {
            group: "Tooling",
            items: ["pnpm", "Git", "Linux", "Docker", "GitHub Actions"],
        },
    ],
    security: [
        {
            group: "Smart contracts",
            items: ["Solidity", "Foundry", "OpenZeppelin", "Chainlink", "ERC-20 / ERC-4626 patterns"],
        },
        {
            group: "Analysis",
            items: ["Slither", "Invariant & stateful fuzzing", "forge coverage", "Manual review"],
        },
        {
            group: "Method",
            items: ["Threat modelling", "Proof-of-concept reproduction", "Severity triage"],
        },
        {
            group: "Systems",
            items: ["Ethereum", "Cosmos / Osmosis", "Bittensor", "Linux", "Dedicated nodes"],
        },
    ],
}

// ── The two lenses ───────────────────────────────────────────────────────────

export type TrackId = "dev" | "security"

export interface Track {
    id: TrackId
    /** Short label for the switcher. */
    label: string
    /** One line naming the role this lens is aimed at. */
    eyebrow: string
    headline: string
    headlineAccent: string
    blurb: string
    /** Each lens hands over its own resume rather than one compromise document. */
    resume: { href: string; label: string }
    primaryCta: { href: string; label: string }
}

export const TRACKS: Record<TrackId, Track> = {
    dev: {
        id: "dev",
        label: "Full-stack",
        eyebrow: "Full-stack engineer · TypeScript, React 19, Node, SQLite",
        headline: "I build systems that move real money,",
        headlineAccent: "then prove they are correct.",
        blurb: "Trading and data work turned into software: a nine-venue arbitrage platform with a self-hosted dashboard, a SQLite-backed API, and performance work that took the first paint off a third-party origin. The same codebase carries 100+ backend tests and self-hosted fonts, because the two questions I ask about any number are where it came from and how to check it.",
        resume: {
            href: "/Junior_Developer_Lau_Lok_Jing.pdf",
            label: "Developer resume (PDF)",
        },
        primaryCta: {
            href: "https://tradeops-nexus.onrender.com",
            label: "Open the live dashboard",
        },
    },
    security: {
        id: "security",
        label: "Smart contract security",
        eyebrow: "Smart contract auditor · Solidity, Foundry, Slither",
        headline: "Security before productivity —",
        headlineAccent: "reports are public.",
        blurb: "Independent audit work on Uniswap V3 plus a competitive audit reported privately, alongside the habit of testing my own contracts to destruction: stateful invariant fuzzing and 98% line coverage across the Solidity that actually ships in my stablecoin project.",
        resume: {
            href: "/Web3_Developer_Lau_Lok_Jing.pdf",
            label: "Web3 resume (PDF)",
        },
        primaryCta: {
            href: "https://github.com/laulj/audit-reports",
            label: "Read the audit reports",
        },
    },
}

export const DEFAULT_TRACK: TrackId = "dev"

// ── Pending: deliberately not rendered ───────────────────────────────────────

/**
 * Kept in the file rather than deleted, so the gap stays visible in review
 * instead of quietly disappearing.
 *
 * These are claims the previous site made that could not be reproduced from any
 * public source. They are *not* rendered anywhere. Move an entry up into
 * HERO_METRICS only once it has a real `asOf` and a `provenance` a reader could
 * follow.
 */
export const PENDING_METRICS: Metric[] = [
    {
        value: "~39.4k",
        label: "settled legs",
        asOf: "",
        provenance: {
            kind: "command",
            ref: "TODO: re-derive from the ledger query, then stamp the date",
        },
    },
    {
        value: "$30k",
        label: "annual revenue",
        asOf: "",
        provenance: {
            kind: "command",
            ref: "TODO: no source found — a settled ledger total is not revenue",
        },
    },
]
