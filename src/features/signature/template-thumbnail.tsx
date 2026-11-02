import type { ReactNode } from "react"
import type { TemplateId } from "./config"

// Small schematic of each layout: photo (P), name lines (N), contact lines (C),
// social dots (S) and rules (R), drawn in an 80 × 50 box.

const P = (x: number, y: number, r = 9) => (
  <g key={`p${x}${y}`}>
    <circle className="fill-muted" cx={x} cy={y} r={r} />
    <circle
      className="fill-muted-foreground/35"
      cx={x}
      cy={y - r * 0.22}
      r={r * 0.32}
    />
    <path
      className="fill-muted-foreground/35"
      d={`M${x - r * 0.55} ${y + r * 0.62}a${r * 0.55} ${r * 0.45} 0 0 1 ${r * 1.1} 0z`}
    />
  </g>
)
const N = (x: number, y: number, w = 26) => (
  <g key={`n${x}${y}`}>
    <rect
      className="fill-muted-foreground/45"
      x={x}
      y={y}
      width={w}
      height={3}
      rx={1.5}
    />
    <rect
      className="fill-muted-foreground/25"
      x={x}
      y={y + 6}
      width={w * 0.65}
      height={3}
      rx={1.5}
    />
  </g>
)
const C = (x: number, y: number, w = 30, n = 3) => (
  <g key={`c${x}${y}`}>
    {Array.from({ length: n }, (_, i) => (
      <rect
        key={i}
        className="fill-muted-foreground/25"
        x={x}
        y={y + i * 6}
        width={w}
        height={3}
        rx={1.5}
      />
    ))}
  </g>
)
const S = (x: number, y: number) => (
  <g key={`s${x}${y}`}>
    {[0, 1, 2].map((i) => (
      <circle
        key={i}
        className="fill-primary/60"
        cx={x + i * 7}
        cy={y}
        r={2.6}
      />
    ))}
  </g>
)
const R = (x: number, y: number, w: number) => (
  <rect
    key={`r${x}${y}`}
    className="fill-primary/50"
    x={x}
    y={y}
    width={w}
    height={1}
  />
)

const THUMBS: Record<TemplateId, ReactNode[]> = {
  1: [P(16, 16), S(9, 34), N(34, 9), R(34, 21, 22), C(34, 26)],
  2: [P(40, 11, 8), N(28, 22), C(10, 34, 26), S(52, 40)],
  3: [P(13, 16), N(26, 10, 18), R(47, 6, 0.8), C(51, 9, 22), S(8, 38)],
  4: [N(8, 9), R(8, 21, 22), C(8, 26), P(62, 16), S(55, 34)],
  5: [N(8, 9), P(64, 14), C(8, 22, 30), R(8, 39, 64), S(8, 44)],
  6: [P(16, 13), N(6, 26, 20), R(38, 8, 0.8), C(44, 10), S(44, 32)],
  7: [P(14, 13), N(28, 8), R(8, 26, 64), C(8, 31, 26), S(52, 41)],
  8: [P(14, 13), N(28, 8), C(8, 30, 22, 2), C(42, 30, 26, 2), S(8, 44)],
  9: [N(8, 9), P(64, 14), C(8, 24), S(33, 44)],
  10: [P(15, 20), R(29, 6, 0.8), N(34, 7), C(34, 20, 28), S(34, 42)],
  11: [N(8, 8), C(8, 22), S(8, 42), P(62, 18)],
  12: [N(8, 6), P(16, 27), C(32, 21, 34), S(8, 44)],
}

export function TemplateThumbnail({ id }: { id: TemplateId }) {
  return (
    // "size-auto" opts out of the toggle's default 16px icon sizing.
    <svg
      viewBox="0 0 80 50"
      aria-hidden="true"
      className="block size-auto w-full"
    >
      {THUMBS[id]}
    </svg>
  )
}
