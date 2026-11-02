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
// Line width of the ring around the photo.
export const PHOTO_BORDER_WIDTHS = {
  thin: { name: "Thin", px: 1 },
  regular: { name: "Regular", px: 2 },
  bold: { name: "Bold", px: 3 },
} as const
export type PhotoBorderWidth = keyof typeof PHOTO_BORDER_WIDTHS
export const FONT_SIZES = {
  s: { name: "Small", px: 12 },
  m: { name: "Medium", px: 13 },
  l: { name: "Large", px: 14 },
} as const
export type SizeId = keyof typeof PHOTO_SIZES

export const TEMPLATE_IDS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
  23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37,
] as const
export type TemplateId = (typeof TEMPLATE_IDS)[number]

// Shown in the template picker. The ids stay numbers so saved choices keep
// working.
export const TEMPLATE_NAMES: Record<TemplateId, string> = {
  1: "Photo left",
  2: "Centred",
  3: "Three columns",
  4: "Photo right",
  5: "Header photo",
  6: "Side divider",
  7: "Accent rule",
  8: "Two-column contacts",
  9: "Stacked",
  10: "Photo panel",
  11: "Compact",
  12: "Name on top",
  13: "Banner",
  14: "Card",
  15: "Minimal",
  16: "Elegant",
  17: "Corporate",
  18: "Ribbon",
  19: "Classic",
  20: "Monogram",
  21: "Inline",
  22: "Split",
  23: "Footer strip",
  24: "Centred minimal",
  25: "Headline",
  26: "Business card",
  27: "Icon row",
  28: "Centred icons",
  29: "Icon strip",
  30: "Icon card",
  31: "Double rule",
  32: "Letterpress",
  33: "Spotlight",
  34: "Postcard",
  35: "Signature",
  36: "Outline card",
  37: "Plain",
}

// Style groups for the picker's filter, so the list stays easy to browse.
export const TEMPLATE_STYLES = {
  clean: "Clean",
  minimal: "Minimal",
  classic: "Classic",
  bold: "Bold",
  unique: "Unique",
} as const
export type TemplateStyle = keyof typeof TEMPLATE_STYLES

export const TEMPLATE_STYLE: Record<TemplateId, TemplateStyle> = {
  1: "clean",
  2: "clean",
  3: "clean",
  4: "clean",
  5: "clean",
  6: "clean",
  7: "clean",
  8: "clean",
  9: "clean",
  10: "clean",
  11: "minimal",
  12: "clean",
  13: "bold",
  14: "bold",
  15: "minimal",
  16: "classic",
  17: "classic",
  18: "bold",
  19: "classic",
  20: "unique",
  21: "minimal",
  22: "bold",
  23: "bold",
  24: "minimal",
  25: "bold",
  26: "classic",
  27: "unique",
  28: "unique",
  29: "minimal",
  30: "bold",
  31: "classic",
  32: "classic",
  33: "bold",
  34: "unique",
  35: "unique",
  36: "clean",
  37: "minimal",
}

// Templates that show no photo whatever the photo setting, and why.
export const TEMPLATE_PHOTO_NOTE: Partial<Record<TemplateId, string>> = {
  20: "Monogram shows your initials instead of a photo.",
  37: "Plain is text only, so it shows no photo.",
}

// The picker lists templates by name, A to Z.
export const TEMPLATES_BY_NAME: ReadonlyArray<TemplateId> = [
  ...TEMPLATE_IDS,
].sort((a, b) => TEMPLATE_NAMES[a].localeCompare(TEMPLATE_NAMES[b], "en"))

export type SignatureFields = {
  first: string
  last: string
  title: string
  dept: string
  company: string
  /** Company website; the company name links to it. */
  companyUrl: string
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
  /** A ring in the theme colour around the photo. */
  photoBorder: boolean
  photoBorderWidth: PhotoBorderWidth
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
    companyUrl: "",
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
  photoBorder: true,
  photoBorderWidth: "thin",
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
