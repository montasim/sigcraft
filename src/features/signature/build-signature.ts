import {
  COLORS,
  DEFAULT_PHOTO_PATH,
  DEFAULT_PHOTO_URL,
  FONTS,
  FONT_SIZES,
  PHOTO_BORDER_WIDTHS,
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
const PANEL = "#f6f7f9"
// Paper tone for the Postcard template.
const PAPER = "#fffaf0"
// Email-safe serif, for the classic templates that set their own typeface.
const SERIF = "Georgia,'Times New Roman',Times,serif"

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

// A table's align attribute positions it through its margins. Pages that
// reset margins (the app's own CSS does) would undo that, so the same margins
// are also set inline.
const ALIGN_MARGIN = {
  center: "margin-left:auto;margin-right:auto;",
  right: "margin-left:auto;margin-right:0;",
}
const TB = (inner: string, attrs = "") => {
  const align = /align="(center|right)"/.exec(attrs)?.[1] as
    keyof typeof ALIGN_MARGIN | undefined
  return `<table cellpadding="0" cellspacing="0" border="0"${attrs} style="border-collapse:collapse;${align ? ALIGN_MARGIN[align] : ""}">${inner}</table>`
}
// A table whose cell borders stay separate. Collapsed borders ignore
// border-radius and draw square corners, so rounded, bordered panels use
// this instead.
const TBS = (inner: string) =>
  `<table cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;">${inner}</table>`
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
  // `uniform` draws contact icons in the social style too, for rows that mix
  // both; brand colours, which only social icons have, fall back to solid.
  const icon = (key: IconKey, size: number, alt: string, uniform = false) => {
    const custom = s.customIcons[key].trim()
    if (custom) return img(fullUrl(custom), size, "0", alt)
    const style = !isContactIcon(key)
      ? s.socialIconStyle
      : uniform
        ? s.socialIconStyle === "brand"
          ? "solid"
          : s.socialIconStyle
        : s.contactIconStyle
    return img(
      origin + iconPath(style, theme, key),
      size,
      style === "outline" ? "0" : "50%",
      alt
    )
  }
  const a = (href: string, label: string) =>
    `<a href="${esc(href)}" target="_blank" style="color:${link};text-decoration:none;">${esc(label)}</a>`

  // With the photo border on, the photo sits inside a ring in the theme
  // colour (white on theme-coloured panels), at the chosen line width. The
  // image shrinks by the ring's width, so the photo takes the same space
  // either way and no layout moves. The ring is on a wrapper, not a table
  // cell: collapsed table borders ignore border-radius.
  const RING_GAP = 3
  const photo = (size: number = photoPx, ringColor = theme) => {
    if (!s.showPhoto) return ""
    if (!s.photoBorder) return img(photoSrc(), size, radius, name)
    const line = PHOTO_BORDER_WIDTHS[s.photoBorderWidth].px
    const ring = RING_GAP + line // per side
    const ringRadius =
      radius === "50%"
        ? "50%"
        : radius === "0"
          ? "0"
          : `${parseInt(radius, 10) + ring}px`
    return `<div style="display:inline-block;padding:${RING_GAP}px;border:${line}px solid ${ringColor};border-radius:${ringRadius};line-height:0;font-size:0;">${img(photoSrc(), size - ring * 2, radius, name)}</div>`
  }

  // One short line in a muted (or theme) colour, so it reads as a sign-off
  // rather than competing with the name and title.
  const sloganText = f.slogan.trim().slice(0, SLOGAN_MAX_LENGTH)
  // A numeric maxWidth makes a long slogan wrap instead of stretching the
  // layout; it is a fixed pixel cap, so the signature keeps the same size in
  // any window. "line" keeps it on one line instead.
  const slogan = (
    align: "left" | "center" = "left",
    maxWidth: number | "line",
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
    const width =
      maxWidth === "line" ? "white-space:nowrap;" : `max-width:${maxWidth}px;`
    return `<div style="${T(base - 1, accent ? theme : MUTED, `${italic}${bar}${width}${center}text-align:${align};${extra}`)}">${esc(sloganText)}</div>`
  }

  // Variants:
  // - "dark": white text for a theme-coloured banner
  // - "elegant": a light-weight name over a spaced-out uppercase title
  // - "accent": the title in the theme colour
  // - "pill": the title as a small filled label
  // - "underline": a theme-coloured rule under the name only
  // - "headline": a large name over a small uppercase title in the theme colour
  // - "inline": name, title and organisation on one line
  // - "brand": the name in the theme colour over a muted title
  // - "smallcaps": a spaced-out capital name over an italic title
  // - "serif": a book-face name and italic title, whatever the chosen font
  // - "script": a large italic serif name, like a signed sign-off
  type NameStyle =
    | "default"
    | "dark"
    | "elegant"
    | "accent"
    | "pill"
    | "underline"
    | "headline"
    | "inline"
    | "brand"
    | "smallcaps"
    | "serif"
    | "script"
  const nameBlock = (
    align: "left" | "center" = "left",
    style: NameStyle = "default"
  ) => {
    const ta = `text-align:${align};`
    const dark = style === "dark"
    const ink = dark ? "#ffffff" : text
    // With a job title, the company joins it on one line ("Co-founder at
    // Qubrel"), so it's clear where the role is. Without one, the department
    // and company share a line on their own.
    const role = [f.title, f.dept].filter(Boolean).map(esc).join(", ")
    // The role line's colour differs by style; a linked company name keeps
    // it rather than turning into a blue link.
    const roleColor =
      style === "elegant" ||
      style === "inline" ||
      style === "brand" ||
      style === "smallcaps" ||
      style === "serif" ||
      style === "script"
        ? MUTED
        : style === "headline" || style === "accent"
          ? theme
          : ink
    const companyUrl = fullUrl(f.companyUrl)
    const company = (color: string) =>
      companyUrl
        ? `<a href="${esc(companyUrl)}" target="_blank" style="color:${color};font-weight:bold;text-decoration:none;">${esc(f.company)}</a>`
        : `<span style="font-weight:bold;">${esc(f.company)}</span>`
    const atCompany = f.company
      ? `<span style="font-weight:normal;">&nbsp;at&nbsp;</span>${company(roleColor)}`
      : ""
    const sep = `<span style="color:${dark ? "#ffffff" : theme};">&nbsp;|&nbsp;</span>`
    const org = f.title
      ? ""
      : [f.dept && esc(f.dept), f.company && company(ink)]
          .filter(Boolean)
          .join(sep)
    // A banner can't hold the muted slogan; that layout places it itself.
    const underName =
      s.sloganPosition === "name" && !dark
        ? slogan(align, 300, "padding-top:4px;")
        : ""
    const pronouns = f.pronouns
      ? `<div style="${T(base - 1, dark ? "#ffffff" : MUTED, ta)}">${esc(f.pronouns)}</div>`
      : ""

    if (style === "inline") {
      const dot = `<span style="color:${theme};">&nbsp;&middot;&nbsp;</span>`
      const rest = f.title
        ? [role + atCompany]
        : [f.dept && esc(f.dept), f.company && company(MUTED)].filter(Boolean)
      return (
        `<div style="${T(base + 2, text, ta)}"><span style="font-weight:bold;">${esc(name)}</span>${rest.length ? `<span style="color:${MUTED};">${dot}${rest.join(dot)}</span>` : ""}</div>` +
        pronouns +
        underName
      )
    }

    // Name and title looks per style; anything not listed uses the default.
    const NAME_CSS: Partial<Record<NameStyle, string>> = {
      elegant: T(base + 7, ink, "font-weight:normal;letter-spacing:0.2px;"),
      headline: T(base + 11, ink, "font-weight:bold;letter-spacing:-0.5px;"),
      brand: T(base + 5, theme, "font-weight:bold;"),
      smallcaps: T(
        base + 1,
        ink,
        "font-weight:bold;text-transform:uppercase;letter-spacing:2.5px;"
      ),
      serif: T(base + 7, ink, `font-family:${SERIF};font-weight:normal;`),
      script: T(
        base + 12,
        ink,
        `font-family:${SERIF};font-style:italic;font-weight:normal;`
      ),
    }
    const TITLE_CSS: Partial<Record<NameStyle, string>> = {
      elegant: T(
        base - 2,
        MUTED,
        "text-transform:uppercase;letter-spacing:1.5px;padding-top:2px;"
      ),
      headline: T(
        base - 2,
        theme,
        "font-weight:bold;text-transform:uppercase;letter-spacing:1.2px;"
      ),
      accent: T(base, theme, "font-weight:bold;"),
      brand: T(base, MUTED),
      underline: T(base, ink, "padding-top:6px;"),
      smallcaps: T(base, MUTED, "font-style:italic;padding-top:2px;"),
      serif: T(base, MUTED, `font-family:${SERIF};font-style:italic;`),
      script: T(
        base - 2,
        MUTED,
        "text-transform:uppercase;letter-spacing:1.5px;padding-top:2px;"
      ),
    }
    const nameCss =
      (NAME_CSS[style] ?? T(base + 5, ink, "font-weight:bold;")) + ta
    const nameHtml =
      style === "underline"
        ? TB(
            TR(
              TD(
                esc(name),
                `${nameCss}padding-bottom:4px;border-bottom:2px solid ${theme};`
              )
            ),
            align === "center" ? ' align="center"' : ""
          )
        : `<div style="${nameCss}">${esc(name)}</div>`
    const titleCss = (TITLE_CSS[style] ?? T(base, ink)) + ta
    const title = !f.title
      ? ""
      : style === "pill"
        ? `<div style="${T(base, ink, `padding:4px 0 2px;${ta}`)}">${titlePill(role)}${atCompany}</div>`
        : `<div style="${titleCss}">${role}${atCompany}</div>`
    return (
      nameHtml +
      title +
      (org ? `<div style="${T(base, ink, ta)}">${org}</div>` : "") +
      pronouns +
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

  // Every way to reach you as one row of linked icons: phone, email and
  // website first, then the social profiles. The address has no link, so it
  // stays out. Used by the compact icon-row templates in place of the
  // contact list, so it shows even when contact icons are turned off.
  const iconLinks = (align: "left" | "center" = "left") => {
    const phone = f.mobile || f.office
    const list: Array<{ key: IconKey; href: string; alt: string }> = [
      ...(phone
        ? [
            {
              key: (f.mobile ? "mobile" : "phone") as IconKey,
              href: tel(phone),
              alt: phone,
            },
          ]
        : []),
      ...(f.email
        ? [{ key: "email" as IconKey, href: "mailto:" + f.email, alt: f.email }]
        : []),
      ...(f.web
        ? [{ key: "web" as IconKey, href: fullUrl(f.web), alt: bareUrl(f.web) }]
        : []),
      ...SOCIALS.filter((so) => f[so.key]).map((so) => ({
        key: so.key,
        href: fullUrl(f[so.key]),
        alt: so.label,
      })),
    ]
    if (!list.length) return ""
    return TB(
      TR(
        ...list.map((it, i) =>
          TD(
            `<a href="${esc(it.href)}" target="_blank" style="text-decoration:none;">${icon(it.key, 24, it.alt, true)}</a>`,
            `padding:0 ${i < list.length - 1 ? 8 : 0}px 0 0;vertical-align:middle;`
          )
        )
      ),
      align === "center" ? ' align="center"' : ""
    )
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

  // Name block with a rule under it as wide as the widest line, usually the
  // name: the inner table shrinks to its text and the rule fills it.
  const underlinedName = () => stack(10, nameBlock(), hr("fill", theme))

  // Centres a block in its cell. Images are display:block and contact lists
  // are tables, so text-align alone doesn't move them; a centred table does.
  const centered = (html: string) =>
    html ? TB(TR(TD(html)), ' align="center"') : ""

  // The theme colour mixed with white, for soft panel backgrounds. A solid
  // hex rather than transparency, which email clients handle unevenly.
  const tint = (amount: number) =>
    "#" +
    [1, 3, 5]
      .map((i) => {
        const c = parseInt(theme.slice(i, i + 2), 16)
        return Math.round(c + (255 - c) * amount)
          .toString(16)
          .padStart(2, "0")
      })
      .join("")

  // Initials on a theme-coloured tile, used where a photo would go.
  const monogram = (size: number = photoPx) => {
    const letters = [f.first, f.last]
      .map((p) => p.trim().split(/\s+/)[0]?.[0] ?? "")
      .join("")
      .toUpperCase()
    return TB(
      TR(
        TD(
          esc(letters),
          `${T(Math.round(size * 0.36), "#ffffff", `font-weight:bold;line-height:${size}px;`)}width:${size}px;height:${size}px;text-align:center;vertical-align:middle;background-color:${theme};border-radius:${radius};`,
          ` width="${size}" height="${size}" bgcolor="${theme}" align="center"`
        )
      )
    )
  }

  // The job title as a small filled label.
  const titlePill = (html: string) =>
    html
      ? `<span style="${T(base - 2, "#ffffff", `font-weight:bold;background-color:${theme};border-radius:10px;padding:2px 9px;white-space:nowrap;`)}">${html}</span>`
      : ""

  // Contacts on one line, each with its icon, for wide, short layouts.
  const contactsInline = () => {
    const list = contactItems()
    if (!list.length) return ""
    return TB(
      TR(
        ...list.flatMap((it, i) => {
          const gap = i < list.length - 1 ? "padding-right:16px;" : ""
          return [
            s.showIcons
              ? TD(
                  icon(it.key, 16, ""),
                  "padding-right:6px;vertical-align:middle;width:16px;"
                )
              : "",
            TD(
              it.html,
              `${T(base - 1, text, "white-space:nowrap;")}vertical-align:middle;${gap}`
            ),
          ]
        })
      )
    )
  }

  // Contacts as plain text on one line, separated by dots.
  const contactsText = (align: "left" | "center" = "left") => {
    const list = contactItems()
    if (!list.length) return ""
    const dot = `<span style="color:${theme};">&nbsp;&middot;&nbsp;</span>`
    return `<div style="${T(base - 1, text, `text-align:${align};`)}">${list.map((it) => it.html).join(dot)}</div>`
  }

  // A small centred flourish for the Letterpress template.
  const ornament = () =>
    `<div style="${T(base, theme, "text-align:center;letter-spacing:6px;")}">&mdash;&#10022;&mdash;</div>`

  // Contacts as plain text lines with no icons, like a typed signature.
  const contactsLines = () =>
    contactItems()
      .map((it) => `<div style="${T(base, text)}">${it.html}</div>`)
      .join("")

  // A bordered, rounded box, optionally filled.
  const box = (inner: string, style: string, bg?: string) =>
    TBS(
      TR(
        TD(
          inner,
          (bg ? `background-color:${bg};` : "") + style,
          bg ? ` bgcolor="${bg}"` : ""
        )
      )
    )

  // Contacts with a short text label in the theme colour instead of an icon,
  // like a printed business card.
  const LABELS: Record<ContactIconKey, string> = {
    phone: "T",
    mobile: "M",
    email: "E",
    web: "W",
    location: "A",
  }
  const contactsLabeled = () => {
    const list = contactItems()
    if (!list.length) return ""
    return TB(
      list
        .map((it, i) => {
          const pb = i < list.length - 1 ? 4 : 0
          return TR(
            TD(
              LABELS[it.key],
              `${T(base, theme, "font-weight:bold;")}padding:0 10px ${pb}px 0;width:12px;`
            ),
            TD(
              it.html,
              `${T(base, text, "white-space:nowrap;")}padding:0 0 ${pb}px 0;`
            )
          )
        })
        .join("")
    )
  }

  const photoCell = (style = "", attrs = "") =>
    s.showPhoto ? TD(photo(), style, attrs) : ""

  return {
    s,
    theme,
    cols,
    photo,
    nameBlock,
    underlinedName,
    centered,
    tint,
    monogram,
    titlePill,
    contactsInline,
    contactsText,
    contactsLabeled,
    iconLinks,
    contactsLines,
    box,
    ornament,
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
        TD(k.stack(10, k.underlinedName(), k.contacts(), k.cta()))
      )
    ),
  // Everything on one centre line: photo, name, rule, the contact list as a
  // centred block (its rows stay left-aligned so the icons line up), then
  // the social icons and button.
  2: (k) =>
    TB(
      (k.s.showPhoto ? TR(TD(k.centered(k.photo()))) : "") +
        TR(
          TD(
            k.nameBlock("center"),
            k.s.showPhoto ? "padding-top:12px;" : "",
            ' align="center"'
          )
        ) +
        TR(TD(k.hr("fill", k.theme), "padding-top:12px;")) +
        TR(TD(k.centered(k.contacts()), "padding-top:12px;")) +
        (k.socials() || k.cta()
          ? TR(
              TD(
                k.stack(10, k.socials("center"), k.cta("center")),
                "padding-top:14px;",
                ' align="center"'
              )
            )
          : "")
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
          k.stack(10, k.underlinedName(), k.contacts(), k.cta()),
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
        TR(TD(k.contacts(), "padding-top:12px;", ` colspan="${k.cols}"`)) +
        TR(
          TD(
            k.row(16, k.socials(), k.cta()),
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
            k.row(16, k.socials(), k.cta()),
            "padding-top:12px;",
            ` colspan="${k.cols}"`
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
            // A short, thin accent that closes the name block rather than
            // floating between it and the contacts.
            k.stack(6, k.nameBlock(), k.hr(28, k.theme, 2)),
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
  // Banner: name and title in white on a theme-coloured header, details on a
  // light panel below.
  13: (k) =>
    TB(
      TR(
        TD(
          k.row(14, k.photo(64, "#ffffff"), k.nameBlock("left", "dark")),
          `background-color:${k.theme};border-radius:8px 8px 0 0;padding:16px 20px;`,
          ` bgcolor="${k.theme}"`
        )
      ) +
        TR(
          TD(
            k.stack(
              12,
              k.s.sloganPosition === "name" ? k.slogan("left", 300) : "",
              k.contacts(),
              k.row(16, k.socials(), k.cta())
            ),
            `background-color:${PANEL};border-radius:0 0 8px 8px;padding:16px 20px;`,
            ` bgcolor="${PANEL}"`
          )
        )
    ),
  // Card: a soft bordered card, the title as a filled label, and the contact
  // list on its own white inset.
  14: (k) =>
    k.box(
      TB(
        TR(
          k.s.showPhoto
            ? TD(k.photo(72), "padding-right:18px;vertical-align:top;")
            : "",
          TD(
            k.stack(
              12,
              k.nameBlock("left", "pill"),
              k.contacts()
                ? k.box(
                    k.contacts(),
                    `border:1px solid ${RULE};border-radius:8px;padding:10px 12px;`,
                    "#ffffff"
                  )
                : "",
              k.row(16, k.socials(), k.cta())
            )
          )
        )
      ),
      `border:1px solid ${RULE};border-radius:12px;padding:18px;`,
      PANEL
    ),
  // Minimal: one line for who you are, one for how to reach you.
  15: (k) =>
    k.row(
      14,
      k.photo(56),
      k.stack(6, k.nameBlock("left", "inline"), k.contactsText(), k.socials())
    ),
  // Elegant: a light-weight name, spaced-out uppercase title and hairline.
  16: (k) =>
    TB(
      TR(
        k.photoCell("padding-right:20px;vertical-align:middle;"),
        TD(
          k.stack(
            12,
            k.nameBlock("left", "elegant"),
            k.hr("fill"),
            k.contacts(),
            k.row(16, k.socials(), k.cta())
          ),
          "vertical-align:middle;"
        )
      )
    ),
  // Corporate: a solid bar down the left edge, the title in the theme colour.
  17: (k) =>
    TB(
      TR(
        TD(
          k.stack(
            10,
            k.nameBlock("left", "accent"),
            k.hr("fill"),
            k.contacts(),
            k.row(16, k.socials(), k.cta())
          ),
          `border-left:4px solid ${k.theme};padding-left:16px;`
        ),
        k.photoCell("padding-left:24px;vertical-align:middle;")
      )
    ),
  // Ribbon: contacts in two columns between a theme rule and a tinted rule.
  // One column throughout, so the rules span the full width and the photo
  // stays next to the name however wide the contacts are.
  18: (k) =>
    TB(
      TR(TD(k.row(14, k.photo(), k.nameBlock()))) +
        TR(TD("", "height:12px;font-size:0;line-height:0;")) +
        TR(
          TD(
            TB(
              TR(
                TD(k.contacts(["phone", "email"]), "padding-right:24px;"),
                TD(k.contacts(["web", "location"]))
              )
            ),
            `padding:10px 0;border-top:2px solid ${k.theme};border-bottom:2px solid ${k.tint(0.7)};`
          )
        ) +
        TR(TD(k.row(16, k.socials(), k.cta()), "padding-top:12px;"))
    ),
  // Classic: the name underlined in the theme colour, photo on the right.
  19: (k) =>
    TB(
      TR(
        TD(
          k.stack(
            12,
            k.nameBlock("left", "underline"),
            k.contacts(),
            k.row(16, k.socials(), k.cta())
          ),
          "padding-right:24px;vertical-align:middle;"
        ),
        k.photoCell("vertical-align:middle;")
      )
    ),
  // Monogram: your initials on a coloured tile instead of a photo.
  20: (k) =>
    TB(
      TR(
        TD(k.monogram(64), "padding-right:16px;vertical-align:top;"),
        TD(
          k.stack(
            10,
            k.nameBlock(),
            k.contacts(),
            k.row(16, k.socials(), k.cta())
          ),
          `padding-left:16px;border-left:1px solid ${RULE};`
        )
      )
    ),
  // Inline: short and wide, with every contact on a single line.
  21: (k) =>
    TB(
      TR(TD(k.row(14, k.photo(56), k.nameBlock()))) +
        TR(TD(k.hr("fill", k.theme), "padding-top:12px;")) +
        TR(TD(k.contactsInline(), "padding-top:10px;")) +
        TR(TD(k.row(16, k.socials(), k.cta()), "padding-top:12px;"))
    ),
  // Split: a tinted side panel with the photo (or initials) and social
  // icons, details in a bordered panel beside it.
  22: (k) =>
    TBS(
      TR(
        TD(
          k.stack(
            12,
            k.centered(k.s.showPhoto ? k.photo(80) : k.monogram(80)),
            k.socials("center")
          ),
          `background-color:${k.tint(0.9)};border-radius:12px 0 0 12px;padding:18px;vertical-align:middle;`,
          ` bgcolor="${k.tint(0.9)}" align="center"`
        ),
        TD(
          k.stack(
            10,
            k.nameBlock(),
            k.hr("fill", k.theme),
            k.contacts(),
            k.cta()
          ),
          `border:1px solid ${RULE};border-left:0;border-radius:0 12px 12px 0;padding:18px 20px;vertical-align:middle;`
        )
      )
    ),
  // Footer strip: social icons and the button on a tinted strip underneath.
  23: (k) => {
    const strip = k.row(16, k.socials(), k.cta())
    return TB(
      TR(
        k.photoCell("padding-right:16px;vertical-align:middle;"),
        TD(k.stack(10, k.nameBlock(), k.contacts()), "vertical-align:middle;")
      ) +
        (strip
          ? TR(
              TD(
                "",
                "height:14px;font-size:0;line-height:0;",
                ` colspan="${k.cols}"`
              )
            ) +
            TR(
              TD(
                strip,
                `background-color:${k.tint(0.9)};border-radius:8px;padding:8px 12px;`,
                ` colspan="${k.cols}" bgcolor="${k.tint(0.9)}"`
              )
            )
          : "")
    )
  },
  // Centred minimal: a centred column with every contact on one line.
  24: (k) =>
    TB(
      (k.s.showPhoto ? TR(TD(k.centered(k.photo(72)))) : "") +
        TR(
          TD(
            k.nameBlock("center"),
            k.s.showPhoto ? "padding-top:10px;" : "",
            ' align="center"'
          )
        ) +
        TR(TD(k.centered(k.hr(28, k.theme, 2)), "padding-top:10px;")) +
        TR(TD(k.centered(k.contactsInline()), "padding-top:10px;")) +
        (k.socials() || k.cta()
          ? TR(
              TD(
                k.stack(10, k.socials("center"), k.cta("center")),
                "padding-top:12px;",
                ' align="center"'
              )
            )
          : "")
    ),
  // Headline: a large name, the title in small theme-coloured capitals.
  25: (k) =>
    TB(
      TR(
        TD(
          k.stack(
            12,
            k.nameBlock("left", "headline"),
            k.contactsInline(),
            k.row(16, k.socials(), k.cta())
          ),
          "padding-right:24px;vertical-align:middle;"
        ),
        k.photoCell("vertical-align:middle;")
      )
    ),
  // Business card: contacts labelled with letters instead of icons.
  26: (k) =>
    TB(
      TR(
        k.photoCell("padding-right:18px;vertical-align:middle;"),
        TD(
          k.stack(
            10,
            k.nameBlock(),
            k.hr("fill"),
            k.contactsLabeled(),
            k.row(16, k.socials(), k.cta())
          ),
          "vertical-align:middle;"
        )
      )
    ),
  // Icon row: a ringed photo, a bar in the theme colour, the name in the
  // theme colour and every contact as one row of linked icons.
  27: (k) =>
    TB(
      TR(
        k.s.showPhoto
          ? TD(k.photo(), "padding-right:20px;vertical-align:middle;")
          : "",
        TD(
          k.stack(
            10,
            k.nameBlock("left", "brand"),
            k.row(16, k.iconLinks(), k.cta())
          ),
          `padding-left:20px;border-left:3px solid ${k.theme};vertical-align:middle;`
        )
      )
    ),
  // Centred icons: the same pieces on one centre line.
  28: (k) =>
    TB(
      (k.s.showPhoto ? TR(TD(k.centered(k.photo(80)))) : "") +
        TR(
          TD(
            k.nameBlock("center", "brand"),
            k.s.showPhoto ? "padding-top:10px;" : "",
            ' align="center"'
          )
        ) +
        TR(TD(k.centered(k.hr(28, k.theme, 2)), "padding-top:10px;")) +
        TR(
          TD(
            k.stack(10, k.iconLinks("center"), k.cta("center")),
            "padding-top:12px;",
            ' align="center"'
          )
        )
    ),
  // Icon strip: one short line, the name block and icons side by side.
  29: (k) =>
    TB(
      TR(
        k.s.showPhoto
          ? TD(k.photo(56), "padding-right:14px;vertical-align:middle;")
          : "",
        TD(
          k.nameBlock("left", "brand"),
          "padding-right:18px;vertical-align:middle;"
        ),
        TD(
          k.row(16, k.iconLinks(), k.cta()),
          `padding-left:18px;border-left:1px solid ${RULE};vertical-align:middle;`
        )
      )
    ),
  // Icon card: the icon-row layout on a soft tinted card.
  30: (k) =>
    TB(
      TR(
        TD(
          TB(
            TR(
              k.s.showPhoto
                ? TD(k.photo(72), "padding-right:16px;vertical-align:middle;")
                : "",
              TD(
                k.stack(
                  10,
                  k.nameBlock("left", "brand"),
                  k.row(16, k.iconLinks(), k.cta())
                ),
                "vertical-align:middle;"
              )
            )
          ),
          `background-color:${k.tint(0.93)};border-radius:12px;padding:16px 20px;`,
          ` bgcolor="${k.tint(0.93)}"`
        )
      )
    ),
  // Double rule: an old-style block between two double rules, the name in
  // spaced-out capitals and the contacts on one line.
  31: (k) =>
    TB(
      TR(
        k.photoCell("padding-right:20px;vertical-align:middle;"),
        TD(
          TB(
            TR(
              TD(
                k.stack(10, k.nameBlock("left", "smallcaps"), k.contactsText()),
                `padding:12px 0;border-top:3px double ${k.theme};border-bottom:3px double ${k.theme};`
              )
            ) +
              (k.socials() || k.cta()
                ? TR(TD(k.row(16, k.socials(), k.cta()), "padding-top:12px;"))
                : "")
          ),
          "vertical-align:middle;"
        )
      )
    ),
  // Letterpress: centred and set in a serif, with a small ornament.
  32: (k) =>
    TB(
      (k.s.showPhoto ? TR(TD(k.centered(k.photo(72)))) : "") +
        TR(
          TD(
            k.nameBlock("center", "serif"),
            k.s.showPhoto ? "padding-top:10px;" : "",
            ' align="center"'
          )
        ) +
        TR(TD(k.ornament(), "padding-top:6px;", ' align="center"')) +
        TR(
          TD(k.contactsText("center"), "padding-top:6px;", ' align="center"')
        ) +
        (k.socials() || k.cta()
          ? TR(
              TD(
                k.stack(10, k.socials("center"), k.cta("center")),
                "padding-top:12px;",
                ' align="center"'
              )
            )
          : "")
    ),
  // Spotlight: photo and name in white on a theme-coloured panel, details
  // in a bordered panel beside it.
  33: (k) =>
    TBS(
      TR(
        TD(
          k.stack(
            12,
            k.centered(k.photo(80, "#ffffff")),
            k.nameBlock("center", "dark")
          ),
          `background-color:${k.theme};border-radius:12px 0 0 12px;padding:20px;vertical-align:middle;`,
          ` bgcolor="${k.theme}" align="center"`
        ),
        TD(
          k.stack(
            12,
            k.s.sloganPosition === "name" ? k.slogan("left", 300) : "",
            k.contacts(),
            k.row(16, k.socials(), k.cta())
          ),
          `border:1px solid ${RULE};border-left:0;border-radius:0 12px 12px 0;padding:18px 20px;vertical-align:middle;`
        )
      )
    ),
  // Postcard: a dashed border on paper, with lettered contacts.
  34: (k) =>
    k.box(
      TB(
        TR(
          k.photoCell("padding-right:18px;vertical-align:top;"),
          TD(
            k.stack(
              10,
              k.nameBlock("left", "serif"),
              k.hr("fill", k.tint(0.6)),
              k.contactsLabeled(),
              k.row(16, k.socials(), k.cta())
            )
          )
        )
      ),
      `border:2px dashed ${k.tint(0.45)};border-radius:8px;padding:16px 20px;`,
      PAPER
    ),
  // Signature: a large italic name, as if signed, over a short role line.
  35: (k) =>
    TB(
      TR(
        k.photoCell("padding-right:20px;vertical-align:middle;"),
        TD(
          k.stack(
            10,
            k.stack(4, k.nameBlock("left", "script"), k.hr(56, k.theme, 2)),
            k.contactsText(),
            k.row(16, k.socials(), k.cta())
          ),
          "vertical-align:middle;"
        )
      )
    ),
  // Outline card: a white card with a thin border in the theme colour.
  36: (k) =>
    k.box(
      TB(
        TR(
          k.photoCell("padding-right:18px;vertical-align:middle;"),
          TD(
            k.stack(
              10,
              k.nameBlock("left", "accent"),
              k.contacts(),
              k.row(16, k.socials(), k.cta())
            ),
            "vertical-align:middle;"
          )
        )
      ),
      `border:1px solid ${k.theme};border-radius:12px;padding:16px 20px;`,
      "#ffffff"
    ),
  // Plain: text only, line by line, like a signature typed by hand. No
  // photo, so it reads the same in any mail app.
  37: (k) => k.stack(10, k.nameBlock(), k.contactsLines(), k.socials()),
}

// Layouts arranged on one centre line; a footer slogan stays centred too.
const CENTERED: ReadonlySet<TemplateId> = new Set<TemplateId>([2, 24, 28, 32])

export function buildSignature(state: SignatureState, target: BuildTarget) {
  const k = createKit(state, target)
  const body = LAYOUTS[state.template](k)
  if (state.sloganPosition !== "footer" || !k.slogan("left", 0)) return body

  // Footer slogan: below the whole layout, after a thin divider, on one line.
  // The divider spans the wider of the layout and the slogan. Centred
  // templates keep it centred.
  const align = CENTERED.has(state.template) ? "center" : "left"
  return TB(
    TR(TD(body, "", align === "center" ? ' align="center"' : "")) +
      TR(TD(k.hr("fill"), "padding-top:14px;")) +
      TR(
        TD(
          k.slogan(align, "line"),
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
    // Same wording as the HTML: "Co-founder at Qubrel".
    f.title
      ? [f.title, f.dept].filter(Boolean).join(", ") +
        (f.company ? ` at ${f.company}` : "")
      : [f.dept, f.company].filter(Boolean).join(" | "),
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
