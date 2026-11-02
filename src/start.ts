import { createMiddleware, createStart } from "@tanstack/react-start"

/*
 * Security headers for every server response (pages and /api routes).
 * netlify.toml sets the same headers on static files; this covers responses
 * produced by the server function, which those rules may not reach.
 *
 * No Content-Security-Policy yet: the page loads Google Fonts and the
 * SupportKori widget (script + iframe), and a CSP should be added only after
 * those origins are verified on the deployed site.
 */
export const SECURITY_HEADERS: Record<string, string> = {
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
}

const securityHeaders = createMiddleware({ type: "request" }).server(
  async ({ next }) => {
    const result = await next()
    for (const [name, value] of Object.entries(SECURITY_HEADERS))
      result.response.headers.set(name, value)
    return result
  }
)

export const startInstance = createStart(() => ({
  requestMiddleware: [securityHeaders],
}))
