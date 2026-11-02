import { createFileRoute } from "@tanstack/react-router"
import {
  CONTACT_ICON_KEYS,
  CONTACT_ICON_STYLES,
  SOCIAL_ICON_KEYS,
  SOCIAL_ICON_STYLES,
  isContactIcon,
} from "@/features/signature/icon-styles"
import type { IconKey, IconStyle } from "@/features/signature/icon-styles"
import { renderIcon } from "@/server/render-icon"

// Serves signature icons, e.g. /api/icon/v1/soft/ff4800/phone.png.
// The URL fully describes the image, so it is cached forever: Netlify's CDN
// keeps the first render and the function rarely runs again for that URL.
const IMMUTABLE = "public, max-age=31536000, immutable"

const notFound = () =>
  new Response("Not found", {
    status: 404,
    headers: { "Content-Type": "text/plain" },
  })

export const Route = createFileRoute("/api/icon/v1/$style/$color/$file")({
  server: {
    handlers: {
      GET: ({ params }) => {
        const key = params.file.replace(/\.png$/, "") as IconKey
        const style = params.style as IconStyle
        if (!params.file.endsWith(".png")) return notFound()
        if (![...CONTACT_ICON_KEYS, ...SOCIAL_ICON_KEYS].includes(key))
          return notFound()

        const styles = isContactIcon(key)
          ? CONTACT_ICON_STYLES
          : SOCIAL_ICON_STYLES
        if (!(style in styles)) return notFound()

        const isBrand = style === "brand"
        if (
          isBrand
            ? params.color !== "brand"
            : !/^[0-9a-f]{6}$/.test(params.color)
        )
          return notFound()

        const png = renderIcon(
          key,
          style,
          isBrand ? "#000000" : `#${params.color}`
        )
        return new Response(new Uint8Array(png), {
          headers: {
            "Content-Type": "image/png",
            "Cache-Control": IMMUTABLE,
            "Netlify-CDN-Cache-Control": `${IMMUTABLE}, durable`,
            "Access-Control-Allow-Origin": "*",
          },
        })
      },
    },
  },
})
