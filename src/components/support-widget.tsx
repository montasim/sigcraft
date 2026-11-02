import { useEffect } from "react"

/*
 * SupportKori widget (https://www.supportkori.com/help/article/setup-widget).
 *
 * The provider script injects two elements into <body>:
 *   .sk-widget-btn               the trigger (a <div> with a coffee icon + label)
 *   .sk-widget-iframe-container  the in-page panel, shown with the "open" class
 * Those class names are the provider's markup, not a published API, so the
 * enhancement below checks they exist before touching them. The visual
 * treatment lives in styles.css under "SupportKori widget".
 */
const SCRIPT_ID = "supportkori-widget"
const PANEL_ID = "supportkori-panel"
const TRIGGER = ".sk-widget-btn"
const PANEL = ".sk-widget-iframe-container"

// The provider's trigger is a plain <div>: make it a keyboard-operable button
// that reports whether the panel is open.
function enhance(trigger: HTMLElement, panel: HTMLElement) {
  if (trigger.dataset.enhanced) return undefined
  trigger.dataset.enhanced = "true"
  panel.id = PANEL_ID
  trigger.setAttribute("role", "button")
  trigger.setAttribute("tabindex", "0")
  trigger.setAttribute("aria-controls", PANEL_ID)
  const sync = () =>
    trigger.setAttribute(
      "aria-expanded",
      String(panel.classList.contains("open"))
    )
  sync()
  trigger.querySelector("svg")?.setAttribute("aria-hidden", "true")

  const onKey = (e: KeyboardEvent) => {
    if (e.key !== "Enter" && e.key !== " ") return
    e.preventDefault()
    trigger.click()
  }
  trigger.addEventListener("keydown", onKey)
  const panelObserver = new MutationObserver(sync)
  panelObserver.observe(panel, { attributes: true, attributeFilter: ["class"] })

  return () => {
    trigger.removeEventListener("keydown", onKey)
    panelObserver.disconnect()
    delete trigger.dataset.enhanced
  }
}

export function SupportWidget() {
  useEffect(() => {
    let cleanupEnhance: (() => void) | undefined

    // The script and the provider's markup stay for the page's lifetime.
    // Removing the <script> on unmount does not stop a download already in
    // flight, so React's development remount would run the provider twice and
    // inject a second trigger. Every mount checks for the script instead.
    if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement("script")
      script.id = SCRIPT_ID
      script.src = "https://www.supportkori.com/widget.js"
      script.async = true
      script.dataset.id = "montasim"
      script.dataset.message = "Support"
      script.dataset.color = "#ff4800"
      script.dataset.position = "right"
      document.body.append(script)
    }

    // Wait for the provider markup, then stop watching.
    const tryEnhance = () => {
      const trigger = document.querySelector<HTMLElement>(TRIGGER)
      const panel = document.querySelector<HTMLElement>(PANEL)
      if (!trigger || !panel) return false
      cleanupEnhance = enhance(trigger, panel)
      return true
    }
    const bodyObserver = new MutationObserver(() => {
      if (tryEnhance()) bodyObserver.disconnect()
    })
    if (!tryEnhance()) bodyObserver.observe(document.body, { childList: true })
    // Give up quietly if the provider never loads (offline, blocked).
    const giveUp = window.setTimeout(() => bodyObserver.disconnect(), 30_000)

    return () => {
      window.clearTimeout(giveUp)
      bodyObserver.disconnect()
      cleanupEnhance?.()
    }
  }, [])
  return null
}
