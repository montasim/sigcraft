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
} from "@/components/icons"
import type { IconGlyph } from "@/components/icons"
import type { IconKey } from "./icon-styles"

// The editor's icon for each contact and social detail, matching what the
// signature shows next to it.
export const FIELD_ICONS: Record<IconKey, IconGlyph> = {
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
