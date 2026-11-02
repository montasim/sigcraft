// Copies text or rich HTML. Falls back to selecting an off-screen copy and
// using the legacy copy command when the async Clipboard API is unavailable.

function copyWithSelection(fill: (sink: HTMLElement) => void) {
  const sink = document.createElement("div")
  sink.setAttribute("aria-hidden", "true")
  sink.style.cssText = "position:fixed;left:-10000px;top:0;white-space:pre"
  fill(sink)
  document.body.append(sink)
  const range = document.createRange()
  range.selectNodeContents(sink)
  const selection = window.getSelection()
  selection?.removeAllRanges()
  selection?.addRange(range)
  let ok = false
  try {
    ok = document.execCommand("copy")
  } catch {
    ok = false
  }
  selection?.removeAllRanges()
  sink.remove()
  return ok
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return copyWithSelection((sink) => (sink.textContent = text))
  }
}

// Writes both formats so pasting into Gmail keeps the formatting and pasting
// into a plain-text field still gives readable text.
export async function copyHtml(html: string) {
  const holder = document.createElement("div")
  holder.innerHTML = html
  const text = holder.innerText
  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([text], { type: "text/plain" }),
      }),
    ])
    return true
  } catch {
    return copyWithSelection((sink) => {
      sink.style.whiteSpace = "normal"
      sink.innerHTML = html
    })
  }
}
