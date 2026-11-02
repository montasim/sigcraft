import { createContext, useContext, useEffect, useState } from "react"

export type Theme = "light" | "dark" | "system"
type ResolvedTheme = "light" | "dark"

const STORAGE_KEY = "sigcraft:theme"
const THEMES: Theme[] = ["light", "dark", "system"]

/*
 * Runs in <head> before the page paints, so a saved dark theme never flashes
 * light first. Kept as a string because it executes before React loads.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${STORAGE_KEY}");var d=t==="dark"||((t!=="light")&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);}catch(e){}})();`

const ThemeContext = createContext<{
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
} | null>(null)

const systemPrefersDark = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Starts as "system" on the server and the first client render; the saved
  // choice is applied right after hydration.
  const [theme, setThemeState] = useState<Theme>("system")
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light")

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Theme | null
      if (saved && THEMES.includes(saved)) setThemeState(saved)
    } catch {
      // Storage can be blocked; stay on the system theme.
    }
  }, [])

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const apply = () => {
      const dark =
        theme === "dark" || (theme === "system" && systemPrefersDark())
      document.documentElement.classList.toggle("dark", dark)
      setResolvedTheme(dark ? "dark" : "light")
    }
    apply()
    if (theme !== "system") return
    media.addEventListener("change", apply)
    return () => media.removeEventListener("change", apply)
  }, [theme])

  const setTheme = (next: Theme) => {
    setThemeState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Ignore quota and privacy-mode errors.
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider")
  return ctx
}
