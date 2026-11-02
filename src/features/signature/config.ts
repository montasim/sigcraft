import type { ContactIconStyle, IconKey, SocialIconStyle } from "./icon-styles"

// Gmail can't store images inside a pasted signature, so the icons and the
// photo are loaded from this public address. Override with VITE_SITE_URL when
// the app runs on another domain.
export const SITE_URL = (
  import.meta.env.VITE_SITE_URL ?? "https://sigcraft.netlify.app"
).replace(/\/+$/, "")

export const DEFAULT_PHOTO_PATH = "/images/signature/photo.jpg"
export const DEFAULT_PHOTO_URL = SITE_URL + DEFAULT_PHOTO_PATH

// Gmail rejects signatures longer than this.
export const GMAIL_SIGNATURE_LIMIT = 10_000

// A slogan longer than this wraps into a paragraph and stops reading as a
// one-line sign-off.
export const SLOGAN_MAX_LENGTH = 120

export const SLOGAN_POSITIONS = {
  footer: "Footer",
  name: "Under name",
} as const
export const SLOGAN_STYLES = {
  italic: "Italic",
  plain: "Plain",
  accent: "Accent",
} as const
export type SloganPosition = keyof typeof SLOGAN_POSITIONS
export type SloganStyle = keyof typeof SLOGAN_STYLES

// Quick picks for the theme colour; any other hex colour works too, because
// icons are drawn on request (see src/routes/api/icon).
export const COLORS = {
  orange: { name: "Orange", hex: "#ff4800" },
  rust: { name: "Rust", hex: "#c2410c" },
  teal: { name: "Teal", hex: "#0f6b66" },
  navy: { name: "Navy", hex: "#1f3a6e" },
  blue: { name: "Blue", hex: "#2563eb" },
  slate: { name: "Slate", hex: "#334155" },
  burgundy: { name: "Burgundy", hex: "#7a2335" },
  rose: { name: "Rose", hex: "#db2777" },
  violet: { name: "Violet", hex: "#6d28d9" },
} as const
export type ColorId = keyof typeof COLORS

export const FONTS = {
  arial: { name: "Arial", stack: "Arial,Helvetica,sans-serif" },
  helvetica: { name: "Helvetica", stack: "Helvetica,Arial,sans-serif" },
  verdana: { name: "Verdana", stack: "Verdana,Geneva,sans-serif" },
  tahoma: { name: "Tahoma", stack: "Tahoma,Geneva,sans-serif" },
  trebuchet: { name: "Trebuchet MS", stack: "'Trebuchet MS',Arial,sans-serif" },
  georgia: { name: "Georgia", stack: "Georgia,'Times New Roman',serif" },
  times: { name: "Times New Roman", stack: "'Times New Roman',Times,serif" },
  courier: { name: "Courier New", stack: "'Courier New',Courier,monospace" },
} as const
export type FontId = keyof typeof FONTS

export const SOCIALS = [
  {
    key: "linkedin",
    label: "LinkedIn",
    placeholder: "linkedin.com/in/username",
  },
  { key: "github", label: "GitHub", placeholder: "github.com/username" },
  { key: "x", label: "X (Twitter)", placeholder: "x.com/username" },
  { key: "facebook", label: "Facebook", placeholder: "facebook.com/username" },
  {
    key: "instagram",
    label: "Instagram",
    placeholder: "instagram.com/username",
  },
  { key: "youtube", label: "YouTube", placeholder: "youtube.com/@channel" },
  {
    key: "whatsapp",
    label: "WhatsApp",
    placeholder: "https://wa.me/montasimmamun",
  },
] as const
export type SocialKey = (typeof SOCIALS)[number]["key"]

export const SHAPES = {
  circle: { name: "Circle", radius: "50%" },
  rounded: { name: "Rounded", radius: "12px" },
  square: { name: "Square", radius: "0" },
} as const
export type ShapeId = keyof typeof SHAPES

export const PHOTO_SIZES = {
  s: { name: "Small", px: 80 },
  m: { name: "Medium", px: 96 },
  l: { name: "Large", px: 112 },
} as const
export const FONT_SIZES = {
  s: { name: "Small", px: 12 },
  m: { name: "Medium", px: 13 },
  l: { name: "Large", px: 14 },
} as const
export type SizeId = keyof typeof PHOTO_SIZES

export const TEMPLATE_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const
export type TemplateId = (typeof TEMPLATE_IDS)[number]

export type SignatureFields = {
  first: string
  last: string
  title: string
  dept: string
  company: string
  pronouns: string
  office: string
  mobile: string
  web: string
  email: string
  address: string
  photo: string
  textColor: string
  linkColor: string
  ctaText: string
  ctaUrl: string
  slogan: string
} & Record<SocialKey, string>

export type SignatureState = {
  fields: SignatureFields
  showPhoto: boolean
  showIcons: boolean
  /** Theme colour as #rrggbb. */
  color: string
  contactIconStyle: ContactIconStyle
  socialIconStyle: SocialIconStyle
  sloganPosition: SloganPosition
  sloganStyle: SloganStyle
  /** Optional public image URLs that replace the drawn icons. */
  customIcons: Record<IconKey, string>
  template: TemplateId
  shape: ShapeId
  photoSize: SizeId
  fontSize: SizeId
  font: FontId
}

export const DEFAULT_STATE: SignatureState = {
  fields: {
    first: "Mohammad Montasim",
    last: "Al Mamun Shuvo",
    title: "Senior Software Engineer",
    dept: "",
    company: "",
    pronouns: "",
    office: "",
    mobile: "+8801722815469",
    web: "montasim.dev",
    email: "montasimmamun@gmail.com",
    address: "Dhaka, Bangladesh",
    linkedin: "linkedin.com/in/montasim",
    github: "github.com/montasim",
    x: "",
    facebook: "",
    instagram: "",
    youtube: "",
    whatsapp: "https://wa.me/montasimmamun",
    photo: DEFAULT_PHOTO_URL,
    textColor: "#1f2937",
    linkColor: "#1f2937",
    ctaText: "",
    ctaUrl: "",
    slogan:
      "Building software around predictable behavior and performance that holds up in production.",
  },
  showPhoto: true,
  showIcons: true,
  color: COLORS.orange.hex,
  contactIconStyle: "soft",
  socialIconStyle: "solid",
  sloganPosition: "footer",
  sloganStyle: "italic",
  customIcons: {
    phone: "",
    mobile: "",
    email: "",
    web: "",
    location: "",
    linkedin: "",
    github: "",
    x: "",
    facebook: "",
    instagram: "",
    youtube: "",
    whatsapp: "",
  },
  template: 1,
  shape: "circle",
  photoSize: "m",
  fontSize: "m",
  font: "arial",
}
