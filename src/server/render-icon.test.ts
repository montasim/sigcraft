import { inflateSync } from "node:zlib"
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

  it("puts outline icons on an opaque plate, except in version 1", () => {
    // Alpha just inside the left and top edges, away from the glyph.
    const alpha = (png: Buffer) => {
      // Signature (8) + IHDR chunk (25), then the IDAT length and type (8);
      // the IDAT CRC (4) and the IEND chunk (12) close the file.
      const raw = inflateSync(png.subarray(41, png.length - 16))
      const side = png.readUInt32BE(16)
      const at = (x: number, y: number) =>
        raw[y * (side * 4 + 1) + 1 + x * 4 + 3]
      return [at(2, side / 2), at(side / 2, 2)]
    }
    expect(alpha(renderIcon("linkedin", "outline", "#1f2937"))).toEqual([
      255, 255,
    ])
    expect(
      alpha(renderIcon("linkedin", "outline", "#1f2937", { plate: false }))
    ).toEqual([0, 0])
  })

  it("ignores the theme colour for brand icons", () => {
    expect(renderIcon("github", "brand", "#ff4800")).toEqual(
      renderIcon("github", "brand", "#0f6b66")
    )
  })
})
