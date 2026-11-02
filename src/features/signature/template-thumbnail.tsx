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

// Any filled box: panels, banners, the monogram tile and single text lines.
const B = (
  x: number,
  y: number,
  w: number,
  h: number,
  className = "fill-muted-foreground/25",
  rx = 1.5
) => (
  <rect
    key={`b${x}${y}${w}${h}`}
    className={className}
    x={x}
    y={y}
    width={w}
    height={h}
    rx={rx}
  />
)
// A light grey rule, and vertical rules in grey or the theme colour.
const G = (x: number, y: number, w: number) =>
  B(x, y, w, 0.8, "fill-muted-foreground/30", 0)
const V = (x: number, y: number, h: number, className = "fill-primary/50") =>
  B(x, y, 0.8, h, className, 0)

const THUMBS: Record<TemplateId, ReactNode[]> = {
  1: [P(16, 16), S(9, 34), N(34, 9), R(34, 21, 22), C(34, 26)],
  2: [P(40, 9, 7), N(27, 18), R(27, 29, 26), C(30, 32, 20, 2), S(33, 46)],
  3: [P(13, 16), N(26, 10, 18), V(47, 6, 20), C(51, 9, 22), S(8, 38)],
  4: [N(8, 9), R(8, 21, 22), C(8, 26), P(62, 16), S(55, 34)],
  5: [N(8, 9), P(64, 14), C(8, 22, 30), R(8, 39, 64), S(8, 44)],
  6: [P(16, 13), N(6, 26, 20), V(38, 8, 34), C(44, 10), S(44, 32)],
  7: [P(14, 13), N(28, 8), R(8, 26, 64), C(8, 30, 26, 2), S(8, 44)],
  8: [P(14, 13), N(28, 8), C(8, 30, 22, 2), C(42, 30, 26, 2), S(8, 44)],
  9: [N(8, 9), P(64, 14), C(8, 24, 30, 2), R(8, 37, 64), S(8, 44)],
  10: [P(15, 20), V(29, 6, 38), N(34, 7), C(34, 20, 28), S(34, 42)],
  11: [N(8, 7), R(8, 18, 7), C(8, 23), S(8, 42), P(62, 18)],
  12: [N(8, 6), P(16, 27), C(32, 21, 34), S(8, 44)],
  13: [
    B(4, 3, 72, 20, "fill-primary/70", 3),
    P(15, 13, 6),
    B(25, 9, 26, 3, "fill-white/85"),
    B(25, 15, 17, 3, "fill-white/60"),
    B(4, 23, 72, 24, "fill-muted", 3),
    C(10, 27, 30, 2),
    S(11, 41),
  ],
  14: [
    B(4, 4, 72, 42, "fill-muted stroke-border", 4),
    P(15, 17, 7),
    B(27, 9, 26, 3, "fill-muted-foreground/45"),
    B(27, 15, 15, 4, "fill-primary/60", 2),
    B(27, 22, 42, 12, "fill-card", 2),
    C(30, 25, 28, 2),
    S(29, 40),
  ],
  15: [
    P(11, 21, 6),
    B(21, 14, 16, 3, "fill-muted-foreground/45"),
    B(39, 14, 30, 3),
    B(21, 20, 50, 3),
    S(23, 30),
  ],
  16: [
    P(15, 21, 9),
    B(30, 8, 34, 3.5, "fill-muted-foreground/35"),
    B(30, 14, 22, 2),
    G(30, 21, 42),
    C(30, 25, 26),
    S(31, 45),
  ],
  17: [
    B(6, 6, 2, 40, "fill-primary/70", 0),
    B(12, 8, 26, 3, "fill-muted-foreground/45"),
    B(12, 14, 17, 3, "fill-primary/60"),
    G(12, 21, 34),
    C(12, 25, 28),
    S(13, 44),
    P(63, 22),
  ],
  18: [
    P(14, 12, 7),
    N(26, 7),
    R(6, 22, 68),
    C(6, 26, 22, 2),
    C(40, 26, 26, 2),
    B(6, 37, 68, 1, "fill-primary/25", 0),
    S(7, 44),
  ],
  19: [
    B(8, 8, 30, 3, "fill-muted-foreground/45"),
    R(8, 14, 30),
    B(8, 18, 19, 3),
    C(8, 26, 28),
    S(9, 45),
    P(63, 22),
  ],
  20: [
    B(6, 6, 16, 16, "fill-primary/70", 3),
    V(27, 6, 38, "fill-muted-foreground/30"),
    N(32, 7),
    C(32, 21, 30),
    S(33, 43),
  ],
  21: [
    P(12, 12, 7),
    N(24, 7),
    R(6, 22, 68),
    B(6, 28, 18, 3),
    B(28, 28, 20, 3),
    B(52, 28, 18, 3),
    S(7, 40),
  ],
  22: [
    B(4, 4, 26, 42, "fill-primary/15", 3),
    P(17, 18, 8),
    S(10, 37),
    B(30, 4, 46, 42, "fill-card stroke-border", 3),
    N(35, 10, 30),
    R(35, 23, 30),
    C(35, 27, 28, 2),
  ],
  23: [
    P(14, 14, 8),
    N(28, 7),
    C(28, 20, 28, 2),
    B(4, 34, 72, 12, "fill-primary/15", 3),
    S(11, 40),
  ],
  24: [
    P(40, 10, 6),
    B(25, 19, 30, 3, "fill-muted-foreground/45"),
    B(30, 25, 20, 3),
    R(36, 31, 8),
    B(14, 35, 52, 3),
    S(33, 44),
  ],
  25: [
    B(6, 8, 44, 5, "fill-muted-foreground/45"),
    B(6, 16, 24, 2.5, "fill-primary/60"),
    B(6, 24, 13, 3),
    B(22, 24, 13, 3),
    B(38, 24, 13, 3),
    S(7, 36),
    P(64, 19),
  ],
  26: [
    P(15, 21, 9),
    N(30, 7),
    G(30, 20, 40),
    ...[24, 30, 36].flatMap((y) => [
      B(30, y, 3, 3, "fill-primary/60"),
      B(36, y, 26, 3),
    ]),
    S(31, 45),
  ],
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
