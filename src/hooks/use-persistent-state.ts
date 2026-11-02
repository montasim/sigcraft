import { useEffect, useState } from "react"

// Keeps state in localStorage for this browser only. The first render always
// uses the initial value so server and client markup match; the saved value
// is applied right after hydration.
export function usePersistentState<T>(
  key: string,
  initial: T,
  restore: (saved: unknown) => T = (saved) => saved as T
) {
  const [value, setValue] = useState<T>(initial)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key)
      if (raw) setValue(restore(JSON.parse(raw)))
    } catch {
      // Storage can be blocked or hold old data; keep the initial value.
    }
    setLoaded(true)
    // Restore once per key; `restore` is a plain parser, not a dependency.
  }, [key])

  useEffect(() => {
    if (!loaded) return
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Ignore quota and privacy-mode errors.
    }
  }, [key, value, loaded])

  return [value, setValue] as const
}
