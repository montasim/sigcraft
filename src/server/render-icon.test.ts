import { describe, expect, it } from "vitest"
import { renderIcon } from "./render-icon"

const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10]
const size = (png: Buffer) => [png.readUInt32BE(16), png.readUInt32BE(20)]

describe("renderIcon", () => {
  it("draws contact icons as 72px PNGs", () => {
    const png = renderIcon("email", "soft", "#ff4800")
    expect([...png.subarray(0, 8)]).toEqual(PNG_SIGNATURE)
    expect(size(png)).toEqual([72, 72])
  })

  it("draws social icons as 96px PNGs", () => {
    expect(size(renderIcon("linkedin", "solid", "#1f3a6e"))).toEqual([96, 96])
  })

  it("draws a different image for each colour", () => {
    expect(renderIcon("web", "solid", "#ff4800")).not.toEqual(
      renderIcon("web", "solid", "#0f6b66")
    )
  })

  it("ignores the theme colour for brand icons", () => {
    expect(renderIcon("github", "brand", "#ff4800")).toEqual(
      renderIcon("github", "brand", "#0f6b66")
    )
  })
})
