import { defineConfig } from "vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import netlify from "@netlify/vite-plugin-tanstack-start"
import viteReact from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  // Variables come from Infisical (pnpm dev) or Netlify (builds), never .env files.
  envDir: false,
  plugins: [
    tailwindcss(),
    tanstackStart(),
    // No edge functions here, and the Deno that Netlify's dev server
    // downloads (2.9+) rejects the --allow-scripts flag it passes.
    netlify({ dev: { edgeFunctions: { enabled: false } } }),
    viteReact(),
  ],
})

export default config
