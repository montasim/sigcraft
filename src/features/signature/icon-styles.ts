// Shared by the editor, the signature builder and the icon route.

export const CONTACT_ICON_KEYS = [
  "phone",
  "mobile",
  "email",
  "web",
  "location",
] as const
export const SOCIAL_ICON_KEYS = [
  "linkedin",
  "github",
  "x",
  "facebook",
  "instagram",
  "youtube",
  "whatsapp",
] as const
export type ContactIconKey = (typeof CONTACT_ICON_KEYS)[number]
export type SocialIconKey = (typeof SOCIAL_ICON_KEYS)[number]
export type IconKey = ContactIconKey | SocialIconKey

export const ICON_LABELS: Record<IconKey, string> = {
  phone: "Office phone",
  mobile: "Mobile phone",
  email: "Email",
  web: "Website",
  location: "Address",
  linkedin: "LinkedIn",
  github: "GitHub",
  x: "X (Twitter)",
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "YouTube",
  whatsapp: "WhatsApp",
}

export const CONTACT_ICON_STYLES = {
  soft: "Soft circle",
  solid: "Solid circle",
  outline: "Outline",
} as const
export const SOCIAL_ICON_STYLES = {
  solid: "Solid circle",
  soft: "Soft circle",
  outline: "Outline",
  brand: "Brand colours",
} as const
export type ContactIconStyle = keyof typeof CONTACT_ICON_STYLES
export type SocialIconStyle = keyof typeof SOCIAL_ICON_STYLES
export type IconStyle = ContactIconStyle | SocialIconStyle

export const BRAND_COLORS: Record<SocialIconKey, string> = {
  linkedin: "#0a66c2",
  github: "#181717",
  x: "#000000",
  facebook: "#1877f2",
  instagram: "#e4405f",
  youtube: "#ff0000",
  whatsapp: "#25d366",
}

export const isContactIcon = (key: IconKey): key is ContactIconKey =>
  (CONTACT_ICON_KEYS as readonly string[]).includes(key)

export const isHexColor = (v: string) => /^#[0-9a-f]{6}$/i.test(v)

// Bump when the drawing changes, so mail apps and CDNs fetch fresh images.
export const ICON_VERSION = "v1"

/**
 * Path of a rendered icon, e.g. /api/icon/v1/soft/ff4800/phone.png.
 * Brand icons ignore the theme colour, so they share one URL per network.
 */
export function iconPath(style: IconStyle, color: string, key: IconKey) {
  const c = style === "brand" ? "brand" : color.replace("#", "").toLowerCase()
  return `/api/icon/${ICON_VERSION}/${style}/${c}/${key}.png`
}
