import type { BootLine } from "@/lib/typing"

/**
 * What the boot intro types.
 *
 * Deliberately not a generic "hello world": every figure is one the site already
 * stands behind, so the intro states the thesis instead of decorating a wait — and
 * `provenance.test.ts` fails if any of them drifts away from the data it quotes.
 *
 * `kind` is what gives it a rhythm. Commands are typed, output lands, and the beat
 * between them is what makes it look like the shell actually ran something.
 */
export const BOOT_LINES: BootLine[] = [
    { text: "~/laulj $ pnpm test", kind: "command" },
    { text: "  124 passed", kind: "output", quotes: "124" },
    { text: "~/laulj $ forge coverage", kind: "command" },
    { text: "  98.45% lines", kind: "output", quotes: "98.45%" },
    { text: "~/laulj $ curl $API/data/profits", kind: "command" },
    { text: "  $44,682.15 · 9 venues", kind: "output", quotes: "$44,682.15" },
    { text: "  every figure above is sourced ↓", kind: "verdict", pauseBeforeMs: 340 },
]
