import type { TrackId } from "./resume"

export interface ProjectLink {
    label: string
    href: string
    /** Shown under the link when the destination needs setting expectations. */
    note?: string
}

export interface Project {
    name: string
    blurb: string
    /** A concrete, checkable detail rather than an adjective. */
    proof?: string
    stack: string[]
    /** Which lens this project is evidence for. */
    tracks: TrackId[]
    links: ProjectLink[]
    /**
     * Featured per lens, so the same project can lead one track and sit mid-list in the
     * other — the full-stack story and the audit story do not share a headline.
     */
    featured?: TrackId[]
}

export const PROJECTS: Project[] = [
    {
        /**
         * The only paid engagement on this page, and the only entry whose evidence
         * is a third party's live site rather than a repository of my own. That makes
         * it the strongest claim here and the easiest one to get wrong: the 2023
         * toolchain named on the resume is not what efengspine.com serves today, so
         * the card describes both states instead of quietly describing one.
         */
        name: "Efeng Spine Healing Center",
        blurb: "A real client's clinic site in Shah Alam — the original 2023 build (Ant Design, React), carried through three releases, then rebuilt in September 2026 as a two-locale prerendered app. The rebuild retired Create React App, Ant Design, Bootstrap and React Spring in favour of React Router 7, Vite and Tailwind, because 52 static pages needed none of them.",
        proof: "In production at efengspine.com: 52 prerendered pages — 26 routes × 2 locales — countable in the published sitemap.",
        stack: ["React Router 7", "Vite", "TypeScript", "Tailwind CSS 4", "pnpm", "Netlify"],
        tracks: ["dev"],
        links: [
            {
                label: "Live site",
                href: "https://efengspine.com",
                note: "A client's site, and the source is theirs — private, so there is no repository to read.",
            },
        ],
        featured: ["dev"],
    },
    {
        name: "TradeOps Nexus",
        blurb: "Self-hosted arbitrage platform: a React 19 dashboard over an Express + SQLite API that consolidates spot, perpetual-futures and funding-rate PnL from nine venues into one ledger. Includes SQLite WAL tuning, a custom aggregate cache that ingestion writes invalidate, per-user row scoping, and egress accounting.",
        proof: "124 backend tests, a documented OpenAPI surface, and a bundle-size budget that fails CI when exceeded.",
        stack: ["React 19", "Vite", "TypeScript", "Tailwind CSS 4", "GSAP", "Express", "SQLite", "Vitest"],
        tracks: ["dev"],
        links: [
            {
                label: "Live dashboard",
                href: "https://tradeops-nexus.onrender.com",
                note: "Demo login: userDemo / demo123 — a shared sample account with three years of history.",
            },
            { label: "Source", href: "https://github.com/laulj/tradeops-nexus" },
        ],
        featured: ["dev"],
    },
    {
        name: "dUSD Stablecoin",
        blurb: "Over-collateralised stablecoin with a liquidation engine: exogenous and endogenous collateral, Chainlink price feeds, and invariant tests that try to break the solvency accounting.",
        proof: "98.45% line and 100% function coverage on the shipped contracts (forge coverage, 2026-09-15).",
        stack: ["Solidity", "Foundry", "Chainlink", "OpenZeppelin"],
        tracks: ["security", "dev"],
        links: [{ label: "Source", href: "https://github.com/laulj/dUSD-stablecoin" }],
        featured: ["security"],
    },
    {
        name: "Audit Reports",
        blurb: "A public record of my audit work: an independent Uniswap V3 review, an on-chain exploit analysis, and the Cyfrin Updraft course reports (PasswordStore, PuppyRaffle, ThunderLoan, TSwap).",
        proof: "Six published PDFs — the findings are written up rather than summarised.",
        stack: ["Solidity", "Foundry", "Slither"],
        tracks: ["security"],
        links: [{ label: "Reports", href: "https://github.com/laulj/audit-reports" }],
        featured: ["security"],
    },
    {
        name: "Merkle Airdrop",
        blurb: "Gas-efficient token distribution using Merkle proofs and signature verification, so an airdrop costs a root and a per-claim proof instead of on-chain storage.",
        stack: ["Solidity", "Foundry", "Merkle trees"],
        tracks: ["security", "dev"],
        links: [{ label: "Source", href: "https://github.com/laulj/merkle-airdrop" }],
        featured: ["dev"],
    },
    {
        name: "Cryptocurrency Portfolio",
        blurb: "CS50 Web final project: a Django app for tracking holdings across multiple portfolios. CoinGecko supplies market metadata and icons, Binance supplies five-second price updates, TradingView charts net worth against time, and React-Spring animates the price changes.",
        proof: "The backend re-validates every sell against live CoinGecko tickers and the stored balance before it will accept it.",
        stack: ["Django", "Python", "jQuery", "React 18", "Bootstrap", "CoinGecko", "Binance"],
        tracks: ["dev"],
        links: [
            {
                label: "Live demo",
                href: "https://cs50-portfolio.onrender.com",
                note: "Free tier — measured at 28 s for a cold first response.",
            },
            { label: "Source", href: "https://github.com/laulj/portfolio" },
        ],
    },
    {
        name: "Running Log",
        blurb: "React front end over a Django/SQLite API for runners to track laps, distances and pace, with the data visualised rather than tabulated.",
        stack: ["React", "Django", "SQLite"],
        tracks: ["dev"],
        links: [
            { label: "Live demo", href: "https://runninglog-app.onrender.com/" },
            { label: "Source", href: "https://github.com/laulj/runningLog-App" },
        ],
    },
]
