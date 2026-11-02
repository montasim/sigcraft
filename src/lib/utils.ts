import { clsx } from "clsx"
import type { ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// tailwind-merge only knows Tailwind's built-in colours. Registering the app's
// custom theme colours (src/styles.css) lets a class like "text-brand-ink"
// replace a component's default "text-foreground" instead of both applying.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      color: [
        "stage",
        "brand-soft",
        "brand-ink",
        "highlight",
        "highlight-foreground",
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
