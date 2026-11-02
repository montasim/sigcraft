/// <reference types="vite/client" />

// Environment variables the app reads. Documented in .env.example.
interface ImportMetaEnv {
  readonly VITE_SITE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
