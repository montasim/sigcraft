import {
  HeadContent,
  Link,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router"

import appCss from "../styles.css?url"
import { AppHeader } from "@/components/app-header"
import { SupportWidget } from "@/components/support-widget"
import { ThemeProvider, themeInitScript } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/sonner"
import { site } from "@/lib/site"

export const Route = createRootRoute({
  // Site-wide defaults; each page route adds its own title, description,
  // canonical URL and social tags through pageHead().
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: site.name },
      { name: "description", content: site.description },
      { name: "theme-color", content: "#fcfcfa" },
      { name: "application-name", content: site.name },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&family=Fraunces:opsz,wght@9..144,400;9..144,500&display=swap",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", sizes: "32x32" },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
    ],
    scripts: [{ children: themeInitScript }],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
})

function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      <span className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
        404
      </span>
      <h1 className="font-heading text-3xl font-normal text-balance">
        This page doesn't exist
      </h1>
      <p className="text-sm text-muted-foreground">
        Check the address, or head back to the signature generator.
      </p>
      <Button asChild size="lg">
        <Link to="/">Go to the signature generator</Link>
      </Button>
    </div>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    // The theme script sets the "dark" class before React hydrates.
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-dvh">
        <ThemeProvider>
          <AppHeader />
          <main>{children}</main>
          <Toaster position="bottom-center" />
          <SupportWidget />
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}
