import { defineConfig } from "vitest/config"

// Unit tests run in Node without the TanStack Start or Netlify plugins.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
})
