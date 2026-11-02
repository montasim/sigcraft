import { crc32, deflateSync } from "node:zlib"
import {
  Call02Icon,
  Facebook01Icon,
  Github01Icon,
  Globe02Icon,
  InstagramIcon,
  Linkedin01Icon,
  Location01Icon,
  Mail01Icon,
  NewTwitterIcon,
  SmartPhone01Icon,
  WhatsappIcon,
  YoutubeIcon,
} from "@hugeicons/core-free-icons"
import { BRAND_COLORS, isContactIcon } from "@/features/signature/icon-styles"
import type {
  IconKey,
  IconStyle,
  SocialIconKey,
} from "@/features/signature/icon-styles"

/*
 * Draws a signature icon as a PNG without any image library: the Hugeicons
 * line glyph is flattened to line segments, and each pixel's coverage comes
 * from its distance to the nearest segment. Icons are drawn at 4× their
 * display size so they stay sharp on high-density screens (contact icons show
 * at 18px, social at 24px).
 */

type IconNode = readonly [string, Readonly<Record<string, string | number>>]

const GLYPHS: Record<IconKey, ReadonlyArray<IconNode>> = {
  phone: Call02Icon,
  mobile: SmartPhone01Icon,
  email: Mail01Icon,
  web: Globe02Icon,
  location: Location01Icon,
  linkedin: Linkedin01Icon,
  github: Github01Icon,
  x: NewTwitterIcon,
  facebook: Facebook01Icon,
  instagram: InstagramIcon,
  youtube: YoutubeIcon,
  whatsapp: WhatsappIcon,
}

type Point = [number, number]

function flatten(nodes: ReadonlyArray<IconNode>): Point[][] {
  const polys: Point[][] = []
  for (const [tag, attrs] of nodes) {
    if (tag === "circle") {
      const cx = Number(attrs.cx)
      const cy = Number(attrs.cy)
      const r = Number(attrs.r)
      const pts: Point[] = []
      for (let i = 0; i <= 48; i++) {
        const t = (i / 48) * Math.PI * 2
        pts.push([cx + r * Math.cos(t), cy + r * Math.sin(t)])
      }
      polys.push(pts)
      continue
    }
    if (tag !== "path" || typeof attrs.d !== "string") continue
    const toks = attrs.d.match(/[A-Za-z]|-?\d*\.?\d+(?:e-?\d+)?/g) ?? []
    let i = 0
    let cmd = ""
    let x = 0
    let y = 0
    let sx = 0
    let sy = 0
    let cur: Point[] = []
    const num = () => Number(toks[i++])
    while (i < toks.length) {
      if (/[A-Za-z]/.test(toks[i])) cmd = toks[i++]
      const rel = cmd === cmd.toLowerCase()
      switch (cmd.toUpperCase()) {
        case "M": {
          const nx = num()
          const ny = num()
          x = rel ? x + nx : nx
          y = rel ? y + ny : ny
          sx = x
          sy = y
          cur = [[x, y]]
          polys.push(cur)
          cmd = rel ? "l" : "L"
          break
        }
        case "L": {
          const nx = num()
          const ny = num()
          x = rel ? x + nx : nx
          y = rel ? y + ny : ny
          cur.push([x, y])
          break
        }
        case "H": {
          const nx = num()
          x = rel ? x + nx : nx
          cur.push([x, y])
          break
        }
        case "V": {
          const ny = num()
          y = rel ? y + ny : ny
          cur.push([x, y])
          break
        }
        case "C": {
          let [x1, y1, x2, y2, ex, ey] = [
            num(),
            num(),
            num(),
            num(),
            num(),
            num(),
          ]
          if (rel) {
            x1 += x
            y1 += y
            x2 += x
            y2 += y
            ex += x
            ey += y
          }
          for (let k = 1; k <= 16; k++) {
            const t = k / 16
            const u = 1 - t
            cur.push([
              u * u * u * x +
                3 * u * u * t * x1 +
                3 * u * t * t * x2 +
                t * t * t * ex,
              u * u * u * y +
                3 * u * u * t * y1 +
                3 * u * t * t * y2 +
                t * t * t * ey,
            ])
          }
          x = ex
          y = ey
          break
        }
        case "Z":
          cur.push([sx, sy])
          x = sx
          y = sy
          break
        default:
          throw new Error(`Unsupported path command ${cmd}`)
      }
    }
  }
  return polys
}

function segDist2(px: number, py: number, s: readonly number[]) {
  const [ax, ay, bx, by] = s
  const dx = bx - ax
  const dy = by - ay
  const l = dx * dx + dy * dy
  const t = l
    ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l))
    : 0
  const qx = ax + t * dx - px
  const qy = ay + t * dy - py
  return qx * qx + qy * qy
}

const rgb = (hex: string) =>
  [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [
    number,
    number,
    number,
  ]

// Pale disc for soft circles: the theme colour mixed mostly with white.
const tint = ([r, g, b]: [number, number, number], amount = 0.86) =>
  [r, g, b].map((c) => Math.round(c + (255 - c) * amount)) as [
    number,
    number,
    number,
  ]

function encodePng(rgba: Buffer, size: number) {
  const raw = Buffer.alloc((size * 4 + 1) * size)
  for (let y = 0; y < size; y++)
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4)
  const chunk = (type: string, data: Buffer) => {
    const len = Buffer.alloc(4)
    len.writeUInt32BE(data.length)
    const td = Buffer.concat([Buffer.from(type), data])
    const crc = Buffer.alloc(4)
    crc.writeUInt32BE(crc32(td) >>> 0)
    return Buffer.concat([len, td, crc])
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // RGBA
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ])
}

/**
 * Renders one icon. `color` is a #rrggbb theme colour (ignored for brand).
 *
 * `plate` puts outline icons on a white rounded square. Dark mode in mail
 * apps recolours text but never images, so a bare dark outline vanishes on a
 * dark background; on a white email the plate is invisible. Version 1 icons,
 * already in sent emails, are drawn without it.
 */
export function renderIcon(
  key: IconKey,
  style: IconStyle,
  color: string,
  { plate = true }: { plate?: boolean } = {}
) {
  const contact = isContactIcon(key)
  const size = contact ? 72 : 96
  const theme = rgb(
    style === "brand" ? BRAND_COLORS[key as SocialIconKey] : color
  )
  const white: [number, number, number] = [255, 255, 255]
  const plated = plate && style === "outline"

  // What fills the circle (null = no circle) and what colour the glyph is.
  const disc =
    style === "outline" ? null : style === "soft" ? tint(theme) : theme
  const ink = style === "solid" || style === "brand" ? white : theme
  const glyph = style === "outline" ? size * 0.86 : contact ? 42 : 54
  const stroke = style === "outline" ? 1.8 : contact ? 2.1 : 2.0

  const scale = glyph / 24
  const off = (size - glyph) / 2
  const segs: number[][] = []
  for (const p of flatten(GLYPHS[key]))
    for (let i = 1; i < p.length; i++)
      segs.push([
        p[i - 1][0] * scale + off,
        p[i - 1][1] * scale + off,
        p[i][0] * scale + off,
        p[i][1] * scale + off,
      ])
  const hw = (stroke * scale) / 2
  const R = size / 2
  const px = Buffer.alloc(size * size * 4)

  // Bucket segments into a coarse grid so each pixel only measures the few
  // segments near it. A segment goes into every cell its padded box touches.
  const CELL = 8
  const cols = Math.ceil(size / CELL)
  const grid: number[][][] = Array.from({ length: cols * cols }, () => [])
  const reach = hw + 1
  for (const s of segs) {
    const cx0 = Math.max(0, Math.floor((Math.min(s[0], s[2]) - reach) / CELL))
    const cx1 = Math.min(
      cols - 1,
      Math.floor((Math.max(s[0], s[2]) + reach) / CELL)
    )
    const cy0 = Math.max(0, Math.floor((Math.min(s[1], s[3]) - reach) / CELL))
    const cy1 = Math.min(
      cols - 1,
      Math.floor((Math.max(s[1], s[3]) + reach) / CELL)
    )
    for (let cy = cy0; cy <= cy1; cy++)
      for (let cx = cx0; cx <= cx1; cx++) grid[cy * cols + cx].push(s)
  }

  // Smooth edges from distance: a pixel half a pixel inside an edge is fully
  // covered, half a pixel outside is empty, and in between blends linearly.
  const coverage = (insideBy: number) =>
    Math.max(0, Math.min(1, insideBy + 0.5))

  for (let yy = 0; yy < size; yy++)
    for (let xx = 0; xx < size; xx++) {
      const fx = xx + 0.5
      const fy = yy + 0.5
      let d2 = Infinity
      for (const s of grid[
        Math.floor(fy / CELL) * cols + Math.floor(fx / CELL)
      ])
        d2 = Math.min(d2, segDist2(fx, fy, s))
      const inkCov = coverage(hw - Math.sqrt(d2))
      const o = (yy * size + xx) * 4
      if (plated) {
        // Signed distance to a rounded square filling the whole image.
        const r = size * 0.22
        const qx = Math.abs(fx - R) - (R - r)
        const qy = Math.abs(fy - R) - (R - r)
        const out =
          Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) +
          Math.min(Math.max(qx, qy), 0) -
          r
        for (let c = 0; c < 3; c++)
          px[o + c] = Math.round(255 + (ink[c] - 255) * inkCov)
        px[o + 3] = Math.round(coverage(-out) * 255)
      } else if (disc) {
        const discCov = coverage(R - Math.hypot(fx - R, fy - R))
        for (let c = 0; c < 3; c++)
          px[o + c] = Math.round(disc[c] + (ink[c] - disc[c]) * inkCov)
        px[o + 3] = Math.round(discCov * 255)
      } else {
        for (let c = 0; c < 3; c++) px[o + c] = ink[c]
        px[o + 3] = Math.round(inkCov * 255)
      }
    }

  return encodePng(px, size)
}
