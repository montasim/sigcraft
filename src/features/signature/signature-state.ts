import {
  COLORS,
  DEFAULT_STATE,
  FONTS,
  FONT_SIZES,
  PHOTO_BORDER_WIDTHS,
  PHOTO_SIZES,
  SHAPES,
  SLOGAN_POSITIONS,
  SLOGAN_STYLES,
  TEMPLATE_IDS,
} from "./config"
import type {
  PhotoBorderWidth,
  SignatureFields,
  SignatureState,
  SloganPosition,
  SloganStyle,
} from "./config"
import {
  CONTACT_ICON_STYLES,
  SOCIAL_ICON_STYLES,
  isHexColor,
} from "./icon-styles"
import type { ContactIconStyle, IconKey, SocialIconStyle } from "./icon-styles"

// Older saves stored a colour name ("teal"); newer ones store the hex value.
function restoreColor(value: unknown) {
  if (typeof value !== "string") return DEFAULT_STATE.color
  if (isHexColor(value)) return value.toLowerCase()
  return value in COLORS
    ? COLORS[value as keyof typeof COLORS].hex
    : DEFAULT_STATE.color
}

const STORAGE_VERSION = 1
export const STORAGE_KEY = `sigcraft:signature:v${STORAGE_VERSION}`

const pick = <T extends string | number>(
  value: unknown,
  allowed: readonly T[],
  fallback: T
): T => (allowed.includes(value as T) ? (value as T) : fallback)

// Accepts whatever was saved in this browser and keeps only valid values, so
// an old or hand-edited entry can't break the page.
export function restoreState(saved: unknown): SignatureState {
  if (!saved || typeof saved !== "object") return DEFAULT_STATE
  const s = saved as Partial<SignatureState>
  const fields = { ...DEFAULT_STATE.fields }
  if (s.fields && typeof s.fields === "object") {
    for (const key of Object.keys(fields) as Array<keyof SignatureFields>) {
      const v = (s.fields as Record<string, unknown>)[key]
      if (typeof v === "string") fields[key] = v
    }
  }
  const customIcons = { ...DEFAULT_STATE.customIcons }
  if (s.customIcons && typeof s.customIcons === "object") {
    for (const key of Object.keys(customIcons) as IconKey[]) {
      const v = (s.customIcons as Record<string, unknown>)[key]
      if (typeof v === "string") customIcons[key] = v
    }
  }
  return {
    fields,
    showPhoto:
      typeof s.showPhoto === "boolean" ? s.showPhoto : DEFAULT_STATE.showPhoto,
    photoBorder:
      typeof s.photoBorder === "boolean"
        ? s.photoBorder
        : DEFAULT_STATE.photoBorder,
    photoBorderWidth: pick(
      s.photoBorderWidth,
      Object.keys(PHOTO_BORDER_WIDTHS) as PhotoBorderWidth[],
      DEFAULT_STATE.photoBorderWidth
    ),
    showIcons:
      typeof s.showIcons === "boolean" ? s.showIcons : DEFAULT_STATE.showIcons,
    color: restoreColor(s.color),
    contactIconStyle: pick(
      s.contactIconStyle,
      Object.keys(CONTACT_ICON_STYLES) as ContactIconStyle[],
      DEFAULT_STATE.contactIconStyle
    ),
    socialIconStyle: pick(
      s.socialIconStyle,
      Object.keys(SOCIAL_ICON_STYLES) as SocialIconStyle[],
      DEFAULT_STATE.socialIconStyle
    ),
    customIcons,
    sloganPosition: pick(
      s.sloganPosition,
      Object.keys(SLOGAN_POSITIONS) as SloganPosition[],
      DEFAULT_STATE.sloganPosition
    ),
    sloganStyle: pick(
      s.sloganStyle,
      Object.keys(SLOGAN_STYLES) as SloganStyle[],
      DEFAULT_STATE.sloganStyle
    ),
    template: pick(s.template, TEMPLATE_IDS, DEFAULT_STATE.template),
    shape: pick(
      s.shape,
      Object.keys(SHAPES) as Array<keyof typeof SHAPES>,
      DEFAULT_STATE.shape
    ),
    photoSize: pick(
      s.photoSize,
      Object.keys(PHOTO_SIZES) as Array<keyof typeof PHOTO_SIZES>,
      DEFAULT_STATE.photoSize
    ),
    fontSize: pick(
      s.fontSize,
      Object.keys(FONT_SIZES) as Array<keyof typeof FONT_SIZES>,
      DEFAULT_STATE.fontSize
    ),
    font: pick(
      s.font,
      Object.keys(FONTS) as Array<keyof typeof FONTS>,
      DEFAULT_STATE.font
    ),
  }
}
