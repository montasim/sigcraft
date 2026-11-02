import {
  COLORS,
  DEFAULT_PHOTO_PATH,
  DEFAULT_PHOTO_URL,
  FONTS,
  FONT_SIZES,
  PHOTO_SIZES,
  SHAPES,
  SITE_URL,
  SLOGAN_MAX_LENGTH,
  SOCIALS,
} from "./config"
import type { SignatureState, TemplateId } from "./config"
import { iconPath, isContactIcon } from "./icon-styles"
import type { ContactIconKey, IconKey } from "./icon-styles"

/*
 * Builds the signature as email-safe HTML: tables and inline styles only, no
 * classes, no SVG and no percentage widths, so Gmail keeps it intact and it
 * renders at the same size in any window.
 *
 * The preview and the copied signature come from the same markup. They differ
 * only in where images load from: the preview uses this site's own paths, the
 * copy uses absolute public URLs that Gmail can fetch.
 */

export type BuildTarget = "preview" | "copy"

const MUTED = "#6b7280"
const RULE = "#e5e7eb"

const esc = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ] as string
  )
export const bareUrl = (u: string) =>
  u
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/+$/, "")
const fullUrl = (u: string) =>
  bareUrl(u)
    ? /^https?:\/\//i.test(u.trim())
      ? u.trim()
      : "https://" + bareUrl(u)
    : ""
const tel = (p: string) => "tel:" + p.replace(/[^\d+]/g, "")
const isHex = (v: string) => /^#[0-9a-f]{6}$/i.test(v)

const TB = (inner: string, attrs = "") =>
  `<table cellpadding="0" cellspacing="0" border="0"${attrs} style="border-collapse:collapse;">${inner}</table>`
const TD = (inner: string, style = "", attrs = "") =>
  `<td${attrs} style="padding:0;vertical-align:top;${style}">${inner}</td>`
const TR = (...cells: string[]) => `<tr>${cells.join("")}</tr>`

function createKit(s: SignatureState, target: BuildTarget) {
  const f = s.fields
  const theme = isHex(s.color) ? s.color : COLORS.orange.hex
  const text = isHex(f.textColor) ? f.textColor : "#1f2937"
  const link = isHex(f.linkColor) ? f.linkColor : text
  const ff = FONTS[s.font].stack
  const base = FONT_SIZES[s.fontSize].px
  const photoPx = PHOTO_SIZES[s.photoSize].px
  const radius = SHAPES[s.shape].radius
  const name = [f.first, f.last].filter(Boolean).join(" ")
  // Site-relative paths in the preview, absolute public URLs in the copy.
  const origin = target === "copy" ? SITE_URL : ""
  const cols = s.showPhoto ? 2 : 1

  const T = (size: number, color: string, extra = "") =>
    `font-family:${ff};font-size:${size}px;line-height:${Math.round(size * 1.45)}px;color:${color};${extra}`
  const photoSrc = () => {
    const custom = f.photo.trim()
    if (!custom || custom === DEFAULT_PHOTO_URL)
      return origin + DEFAULT_PHOTO_PATH
    return fullUrl(custom)
  }
  const img = (src: string, w: number, r: string, alt: string) =>
    `<img src="${esc(src)}" width="${w}" height="${w}" alt="${esc(alt)}" style="display:block;width:${w}px;height:${w}px;border:0;border-radius:${r};">`
  // A custom icon URL wins; otherwise the icon is drawn in the chosen style.
  const icon = (key: IconKey, size: number, alt: string) => {
    const custom = s.customIcons[key].trim()
    if (custom) return img(fullUrl(custom), size, "0", alt)
    const style = isContactIcon(key) ? s.contactIconStyle : s.socialIconStyle
    return img(
      origin + iconPath(style, theme, key),
      size,
      style === "outline" ? "0" : "50%",
      alt
    )
  }
  const a = (href: string, label: string) =>
    `<a href="${esc(href)}" target="_blank" style="color:${link};text-decoration:none;">${esc(label)}</a>`

  const photo = (size = photoPx) =>
    s.showPhoto ? img(photoSrc(), size, radius, name) : ""

  // One short line in a muted (or theme) colour, so it reads as a sign-off
  // rather than competing with the name and title.
  const sloganText = f.slogan.trim().slice(0, SLOGAN_MAX_LENGTH)
  // maxWidth makes a long slogan wrap instead of stretching the layout; it is
  // a fixed pixel cap, so the signature keeps the same size in any window.
  const slogan = (
    align: "left" | "center" = "left",
    maxWidth: number,
    extra = ""
  ) => {
    if (!sloganText) return ""
    const accent = s.sloganStyle === "accent"
    const italic = s.sloganStyle === "plain" ? "" : "font-style:italic;"
    const bar =
      accent && align === "left"
        ? `border-left:2px solid ${theme};padding-left:8px;`
        : ""
    const center = align === "center" ? "margin:0 auto;" : ""
    return `<div style="${T(base - 1, accent ? theme : MUTED, `${italic}${bar}max-width:${maxWidth}px;${center}text-align:${align};${extra}`)}">${esc(sloganText)}</div>`
  }

  const nameBlock = (align: "left" | "center" = "left") => {
    const ta = `text-align:${align};`
    const sep = `<span style="color:${theme};">&nbsp;|&nbsp;</span>`
    const org = [f.dept, f.company].filter(Boolean).map(esc).join(sep)
    const underName =
      s.sloganPosition === "name" ? slogan(align, 300, "padding-top:4px;") : ""
    return (
      `<div style="${T(base + 5, text, "font-weight:bold;" + ta)}">${esc(name)}</div>` +
      (f.title
        ? `<div style="${T(base, text, ta)}">${esc(f.title)}</div>`
        : "") +
      (org ? `<div style="${T(base, text, ta)}">${org}</div>` : "") +
      (f.pronouns
        ? `<div style="${T(base - 1, MUTED, ta)}">${esc(f.pronouns)}</div>`
        : "") +
      underName
    )
  }

  const contactItems = () => {
    const phones = [f.office, f.mobile].filter(Boolean)
    const items: Array<{ key: ContactIconKey; html: string }> = []
    if (phones.length)
      items.push({
        key: f.office ? "phone" : "mobile",
        html: phones
          .map((p) => a(tel(p), p))
          .join(`<span style="color:${MUTED};">&nbsp;|&nbsp;</span>`),
      })
    if (f.email)
      items.push({ key: "email", html: a("mailto:" + f.email, f.email) })
    if (f.web)
      items.push({ key: "web", html: a(fullUrl(f.web), bareUrl(f.web)) })
    if (f.address) items.push({ key: "location", html: esc(f.address) })
    return items
  }

  const contacts = (only?: Array<"phone" | "email" | "web" | "location">) => {
    let list = contactItems()
    if (only)
      list = list.filter((it) =>
        only.includes(it.key === "mobile" ? "phone" : it.key)
      )
    if (!list.length) return ""
    return TB(
      list
        .map((it, i) => {
          const pb = i < list.length - 1 ? 5 : 0
          return TR(
            s.showIcons
              ? TD(
                  icon(it.key, 18, ""),
                  `padding:0 8px ${pb}px 0;vertical-align:middle;width:18px;`
                )
              : "",
            TD(
              it.html,
              `${T(base, text, "white-space:nowrap;")}padding:0 0 ${pb}px 0;vertical-align:middle;`
            )
          )
        })
        .join("")
    )
  }

  const socials = (align: "left" | "center" | "right" = "left") => {
    const list = SOCIALS.filter((so) => f[so.key])
    if (!list.length) return ""
    const cells = list.map((so, i) =>
      TD(
        `<a href="${esc(fullUrl(f[so.key]))}" target="_blank" style="text-decoration:none;">${icon(so.key, 24, so.label)}</a>`,
        `padding:0 ${i < list.length - 1 ? 6 : 0}px 0 0;vertical-align:middle;`
      )
    )
    return TB(TR(...cells), align === "left" ? "" : ` align="${align}"`)
  }

  const cta = (align: "left" | "center" | "right" = "left") => {
    if (!f.ctaText) return ""
    const href = fullUrl(f.ctaUrl || f.web)
    return TB(
      TR(
        TD(
          `<a href="${esc(href)}" target="_blank" style="${T(base, "#ffffff", "font-weight:bold;text-decoration:none;display:inline-block;")}">${esc(f.ctaText)}</a>`,
          `background-color:${theme};border-radius:6px;padding:7px 14px;vertical-align:middle;`,
          ` bgcolor="${theme}"`
        )
      ),
      align === "left" ? "" : ` align="${align}"`
    )
  }

  // Rules never use percentage widths: those make the whole signature stretch
  // to the width of the email. "fill" spans its cell, which is content-sized.
  const hr = (width: number | "fill" = "fill", color = RULE, h = 1) =>
    width === "fill"
      ? `<div style="height:0;line-height:0;font-size:0;border-top:${h}px solid ${color};">&nbsp;</div>`
      : TB(
          TR(
            TD(
              "&nbsp;",
              `width:${width}px;height:${h}px;line-height:${h}px;font-size:${h}px;background-color:${color};`,
              ` width="${width}" height="${h}" bgcolor="${color}"`
            )
          )
        )

  const stack = (gap: number, ...blocks: string[]) => {
    const b = blocks.filter(Boolean)
    return b.length
      ? TB(
          b.map((x, i) => TR(TD(x, i ? `padding-top:${gap}px;` : ""))).join("")
        )
      : ""
  }

  // Blocks side by side, used for "socials + button" footers.
  const row = (gap: number, ...blocks: string[]) => {
    const b = blocks.filter(Boolean)
    return b.length
      ? TB(
          TR(
            ...b.map((x, i) =>
              TD(
                x,
                `vertical-align:middle;${i ? `padding-left:${gap}px;` : ""}`
              )
            )
          )
        )
      : ""
  }

  const photoCell = (style = "", attrs = "") =>
    s.showPhoto ? TD(photo(), style, attrs) : ""

  return {
    s,
    theme,
    cols,
    photo,
    nameBlock,
    slogan,
    contacts,
    socials,
    cta,
    hr,
    stack,
    row,
    photoCell,
  }
}

type Kit = ReturnType<typeof createKit>

// Twelve layouts, each a common professional arrangement of photo, name block,
// contacts, social icons and button.
const LAYOUTS: Record<TemplateId, (k: Kit) => string> = {
  1: (k) =>
    TB(
      TR(
        k.s.showPhoto || k.socials()
          ? TD(
              k.stack(12, k.photo(), k.socials("center")),
              "padding-right:20px;",
              ' align="center"'
            )
          : "",
        TD(
          k.stack(10, k.nameBlock(), k.hr(160, k.theme), k.contacts(), k.cta())
        )
      )
    ),
  2: (k) =>
    TB(
      (k.s.showPhoto
        ? TR(
            TD(
              k.photo(),
              "text-align:center;font-size:0;line-height:0;",
              ' align="center"'
            )
          )
        : "") +
        TR(
          TD(
            k.nameBlock("center"),
            k.s.showPhoto ? "padding-top:12px;" : "",
            ' align="center"'
          )
        ) +
        TR(TD(k.hr("fill", k.theme), "padding-top:12px;")) +
        TR(
          TD(
            TB(
              TR(
                TD(k.contacts(), "padding-right:28px;"),
                TD(
                  k.stack(8, k.socials("right"), k.cta("right")),
                  "vertical-align:bottom;",
                  ' align="right"'
                )
              )
            ),
            "padding-top:12px;"
          )
        )
    ),
  3: (k) =>
    TB(
      TR(
        k.photoCell("padding-right:14px;vertical-align:middle;"),
        TD(k.nameBlock(), "padding-right:18px;vertical-align:middle;"),
        TD(
          k.contacts(),
          `padding-left:18px;border-left:2px solid ${k.theme};vertical-align:middle;`
        )
      ) +
        TR(TD(k.hr("fill"), "padding-top:14px;", ` colspan="${k.cols + 1}"`)) +
        TR(
          TD(
            k.row(16, k.socials(), k.cta()),
            "padding-top:12px;",
            ` colspan="${k.cols + 1}"`
          )
        )
    ),
  4: (k) =>
    TB(
      TR(
        TD(
          k.stack(10, k.nameBlock(), k.hr(160, k.theme), k.contacts(), k.cta()),
          "padding-right:24px;"
        ),
        k.s.showPhoto || k.socials()
          ? TD(
              k.stack(12, k.photo(), k.socials("center")),
              "",
              ' align="center"'
            )
          : ""
      )
    ),
  5: (k) =>
    TB(
      TR(
        TD(k.nameBlock(), "padding-right:24px;vertical-align:middle;"),
        k.photoCell("vertical-align:middle;", ' align="right"')
      ) +
        TR(TD(k.hr("fill"), "padding-top:12px;", ` colspan="${k.cols}"`)) +
        TR(TD(k.contacts(), "padding-top:12px;", ` colspan="${k.cols}"`)) +
        TR(
          TD(
            k.hr("fill", k.theme, 2),
            "padding-top:12px;",
            ` colspan="${k.cols}"`
          )
        ) +
        TR(
          TD(
            k.row(16, k.socials(), k.cta()),
            "padding-top:12px;",
            ` colspan="${k.cols}"`
          )
        )
    ),
  6: (k) =>
    TB(
      TR(
        TD(
          k.stack(10, k.photo(), k.nameBlock()),
          "padding-right:22px;vertical-align:middle;"
        ),
        TD(
          k.stack(12, k.contacts(), k.socials(), k.cta()),
          `padding-left:22px;border-left:1px solid ${k.theme};vertical-align:middle;`
        )
      )
    ),
  7: (k) =>
    TB(
      TR(
        k.photoCell("padding-right:14px;vertical-align:middle;"),
        TD(k.nameBlock(), "vertical-align:middle;")
      ) +
        TR(
          TD(k.hr("fill", k.theme), "padding-top:12px;", ` colspan="${k.cols}"`)
        ) +
        TR(
          TD(
            TB(
              TR(
                TD(k.contacts(), "padding-right:28px;"),
                TD(
                  k.stack(8, k.socials("right"), k.cta("right")),
                  "vertical-align:bottom;",
                  ' align="right"'
                )
              )
            ),
            "padding-top:12px;",
            ` colspan="${k.cols}"`
          )
        )
    ),
  8: (k) =>
    TB(
      TR(
        k.photoCell("padding-right:14px;vertical-align:middle;"),
        TD(k.nameBlock(), "vertical-align:middle;")
      ) +
        TR(TD(k.hr("fill"), "padding-top:12px;", ` colspan="${k.cols}"`)) +
        TR(
          TD(
            TB(
              TR(
                TD(k.contacts(["phone", "email"]), "padding-right:24px;"),
                TD(k.contacts(["web", "location"]))
              )
            ),
            "padding-top:12px;",
            ` colspan="${k.cols}"`
          )
        ) +
        TR(
          TD(
            k.row(16, k.socials(), k.cta()),
            "padding-top:12px;",
            ` colspan="${k.cols}"`
          )
        )
    ),
  9: (k) =>
    TB(
      TR(
        TD(k.nameBlock(), "padding-right:24px;vertical-align:middle;"),
        k.photoCell("vertical-align:middle;", ' align="right"')
      ) +
        TR(TD(k.contacts(), "padding-top:14px;", ` colspan="${k.cols}"`)) +
        TR(
          TD(k.hr("fill", k.theme), "padding-top:12px;", ` colspan="${k.cols}"`)
        ) +
        TR(
          TD(
            k.stack(10, k.socials("center"), k.cta("center")),
            "padding-top:12px;",
            ` colspan="${k.cols}" align="center"`
          )
        )
    ),
  10: (k) =>
    TB(
      TR(
        k.photoCell("padding-right:20px;vertical-align:middle;"),
        TD(
          k.stack(10, k.nameBlock(), k.contacts(), k.socials(), k.cta()),
          k.s.showPhoto
            ? `padding-left:20px;border-left:2px solid ${k.theme};`
            : ""
        )
      )
    ),
  11: (k) =>
    TB(
      TR(
        TD(
          k.stack(
            10,
            k.nameBlock(),
            k.hr(48, k.theme, 3),
            k.contacts(),
            k.socials(),
            k.cta()
          ),
          "padding-right:26px;"
        ),
        k.photoCell()
      )
    ),
  12: (k) =>
    TB(
      TR(TD(k.nameBlock(), "padding-bottom:12px;", ` colspan="${k.cols}"`)) +
        TR(
          k.photoCell("padding-right:18px;vertical-align:middle;"),
          TD(
            k.contacts(),
            `vertical-align:middle;${k.s.showPhoto ? `padding-left:18px;border-left:1px solid ${RULE};` : ""}`
          )
        ) +
        TR(
          TD(
            k.row(16, k.socials(), k.cta()),
            "padding-top:14px;",
            ` colspan="${k.cols}"`
          )
        )
    ),
}

export function buildSignature(state: SignatureState, target: BuildTarget) {
  const k = createKit(state, target)
  const body = LAYOUTS[state.template](k)
  if (state.sloganPosition !== "footer" || !k.slogan("left", 0)) return body

  // Footer slogan: below the whole layout, after a thin divider. The centred
  // template keeps it centred.
  const align = state.template === 2 ? "center" : "left"
  return TB(
    TR(TD(body)) +
      TR(TD(k.hr("fill"), "padding-top:14px;")) +
      TR(
        TD(
          k.slogan(align, 520),
          "padding-top:10px;",
          align === "center" ? ' align="center"' : ""
        )
      )
  )
}

export function buildPlainText(state: SignatureState) {
  const f = state.fields
  const slogan = f.slogan.trim().slice(0, SLOGAN_MAX_LENGTH)
  const identity = [
    [f.first, f.last].filter(Boolean).join(" "),
    f.title,
    [f.dept, f.company].filter(Boolean).join(" | "),
    f.pronouns,
    state.sloganPosition === "name" ? slogan : "",
  ]
  const contact = [
    [f.office, f.mobile].filter(Boolean).join(" | "),
    f.email,
    f.web && bareUrl(f.web),
    f.address,
    ...SOCIALS.filter((so) => f[so.key]).map(
      (so) => `${so.label}: ${bareUrl(f[so.key])}`
    ),
  ]
  const footer = [state.sloganPosition === "footer" ? slogan : ""]
  // Blocks are separated by one blank line; empty lines and blocks drop out.
  return [identity, contact, footer]
    .map((block) => block.filter(Boolean).join("\n"))
    .filter(Boolean)
    .join("\n\n")
}
