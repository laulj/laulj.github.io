import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig({
    // Served from the root of a GitHub Pages *user* site (https://laulj.github.io/),
    // not a /repo/ subpath, so the base is "/". Changing this would break the two
    // resume PDFs under public/, whose live URLs are linked from the profile README.
    base: "/",
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
    plugins: [react(), tailwindcss()],
    build: {
        // No source maps in the deployed bundle: they would ship the full source of
        // a public site for no benefit. Debug against a local build instead.
        sourcemap: false,
    },
    test: {
        // The data layer is the only thing worth testing here, and it is pure, so
        // no DOM is needed.
        environment: "node",
        include: ["src/**/*.test.ts"],
    },
})
