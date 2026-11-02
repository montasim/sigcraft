import { SITE_URL } from "@/features/signature/config"

// One source of truth for the site's identity and social preview.
export const site = {
  name: "Sigcraft",
  url: SITE_URL,
  description:
    "Build a Gmail-ready email signature from 12 templates in any colour, then copy professional email templates for job search, clients and meetings.",
  ogImage: {
    // Versioned filename: change it when the image changes so crawlers refetch.
    url: `${SITE_URL}/og/sigcraft-og-v1.png`,
    width: 1200,
    height: 630,
    type: "image/png",
    alt: "Sigcraft: Gmail-ready email signatures in minutes, with a sample signature card.",
  },
} as const

type PageMeta = { title: string; description: string; path: string }

/**
 * Crawler-visible metadata for one route: title, description, canonical URL,
 * Open Graph and Twitter Card tags, all with absolute HTTPS URLs.
 */
export function pageHead({ title, description, path }: PageMeta) {
  const url = site.url + path
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: site.name },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:image", content: site.ogImage.url },
      { property: "og:image:secure_url", content: site.ogImage.url },
      { property: "og:image:type", content: site.ogImage.type },
      { property: "og:image:width", content: String(site.ogImage.width) },
      { property: "og:image:height", content: String(site.ogImage.height) },
      { property: "og:image:alt", content: site.ogImage.alt },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: site.ogImage.url },
      { name: "twitter:image:alt", content: site.ogImage.alt },
    ],
    links: [{ rel: "canonical", href: url }],
  }
}
