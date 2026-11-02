import { describe, expect, it } from "vitest"
import { buildPlainText, buildSignature } from "./build-signature"
import {
  DEFAULT_STATE,
  GMAIL_SIGNATURE_LIMIT,
  SITE_URL,
  SLOGAN_MAX_LENGTH,
  SLOGAN_POSITIONS,
  TEMPLATE_IDS,
} from "./config"
import type { SignatureState, SloganPosition } from "./config"
import { CONTACT_ICON_STYLES, SOCIAL_ICON_STYLES } from "./icon-styles"
import type { ContactIconStyle, SocialIconStyle } from "./icon-styles"

const fullState: SignatureState = {
  ...DEFAULT_STATE,
  fields: {
    ...DEFAULT_STATE.fields,
    dept: "Engineering",
    company: "Example Co",
    pronouns: "He / Him",
    office: "+880 2 5501 2345",
    x: "x.com/example",
    facebook: "facebook.com/example",
    instagram: "instagram.com/example",
    youtube: "youtube.com/@example",
    ctaText: "View my portfolio",
  },
}

const variants: SignatureState[] = TEMPLATE_IDS.flatMap((template) =>
  [true, false].flatMap((showPhoto) =>
    (Object.keys(CONTACT_ICON_STYLES) as ContactIconStyle[]).flatMap(
      (contactIconStyle) =>
        (Object.keys(SOCIAL_ICON_STYLES) as SocialIconStyle[]).flatMap(
          (socialIconStyle) =>
            (Object.keys(SLOGAN_POSITIONS) as SloganPosition[]).map(
              (sloganPosition) => ({
                ...fullState,
                template,
                showPhoto,
                contactIconStyle,
                socialIconStyle,
                sloganPosition,
                sloganStyle: "accent" as const,
              })
            )
        )
    )
  )
)

const SLOGAN = DEFAULT_STATE.fields.slogan

describe("buildSignature", () => {
  it("builds the same markup for the preview and the copy, apart from the image host", () => {
    for (const state of variants) {
      const preview = buildSignature(state, "preview")
      const copy = buildSignature(state, "copy")
      expect(copy.replaceAll(SITE_URL + "/", "/")).toBe(preview)
    }
  })

  it("uses absolute https image URLs in the copied signature", () => {
    for (const state of variants) {
      const sources = [
        ...buildSignature(state, "copy").matchAll(/src="([^"]+)"/g),
      ].map((m) => m[1])
      expect(sources.length).toBeGreaterThan(0)
      for (const src of sources) expect(src).toMatch(/^https:\/\//)
    }
  })

  it("never uses percentage widths, so the signature can't stretch", () => {
    for (const state of variants)
      expect(buildSignature(state, "copy")).not.toMatch(/width[=:]"?\s*\d+%/)
  })

  it("stays under Gmail's signature length limit with every field filled", () => {
    for (const state of variants)
      expect(buildSignature(state, "copy").length).toBeLessThan(
        GMAIL_SIGNATURE_LIMIT
      )
  })

  it("escapes HTML typed into fields", () => {
    const html = buildSignature(
      {
        ...DEFAULT_STATE,
        fields: { ...DEFAULT_STATE.fields, title: '<img src=x onerror="x">' },
      },
      "copy"
    )
    expect(html).not.toContain("<img src=x")
    expect(html).toContain("&lt;img src=x onerror=&quot;x&quot;&gt;")
  })

  it("shows the company on the job title's line in every template", () => {
    for (const template of TEMPLATE_IDS) {
      const html = buildSignature({ ...fullState, template }, "copy")
      expect(html).toMatch(
        // In the Card template the title is a pill, closed before "at".
        /Senior Software Engineer, Engineering(<\/span>)?<span[^>]*>&nbsp;at&nbsp;<\/span><span[^>]*>Example Co<\/span>/
      )
    }
  })

  it("links the company name to the company website", () => {
    const html = buildSignature(
      {
        ...fullState,
        fields: { ...fullState.fields, companyUrl: "example.co" },
      },
      "copy"
    )
    expect(html).toMatch(/<a href="https:\/\/example\.co"[^>]*>Example Co<\/a>/)
  })

  it("uses a custom icon URL instead of the drawn icon", () => {
    const html = buildSignature(
      {
        ...DEFAULT_STATE,
        customIcons: {
          ...DEFAULT_STATE.customIcons,
          email: "cdn.example.com/mail.png",
        },
      },
      "copy"
    )
    expect(html).toContain('src="https://cdn.example.com/mail.png"')
    expect(html).not.toContain("/email.png")
  })
})

describe("slogan", () => {
  const withSlogan = (patch: Partial<SignatureState>, slogan = SLOGAN) =>
    buildSignature(
      {
        ...DEFAULT_STATE,
        ...patch,
        fields: { ...DEFAULT_STATE.fields, slogan },
      },
      "copy"
    )

  it("sits below everything else in the footer position", () => {
    const html = withSlogan({ sloganPosition: "footer" })
    expect(html.indexOf(SLOGAN)).toBeGreaterThan(
      html.indexOf("Dhaka, Bangladesh")
    )
    expect(html.indexOf(SLOGAN)).toBeGreaterThan(html.indexOf("/linkedin.png"))
  })

  it("sits between the title and the contacts in the under-name position", () => {
    const html = withSlogan({ sloganPosition: "name" })
    expect(html.indexOf(SLOGAN)).toBeGreaterThan(
      html.indexOf("Senior Software Engineer")
    )
    expect(html.indexOf(SLOGAN)).toBeLessThan(
      html.indexOf("montasimmamun@gmail.com")
    )
  })

  it("is left out entirely when empty", () => {
    const empty = withSlogan({ sloganPosition: "footer" }, "   ")
    const none = buildSignature(
      { ...DEFAULT_STATE, fields: { ...DEFAULT_STATE.fields, slogan: "" } },
      "copy"
    )
    expect(empty).toBe(none)
    expect(none).not.toContain("font-style:italic")
  })

  it("escapes HTML and is capped at the maximum length", () => {
    const html = withSlogan({}, "<b>Bold</b> " + "x".repeat(200))
    expect(html).toContain("&lt;b&gt;Bold&lt;/b&gt;")
    const shown = html.match(/&lt;b&gt;Bold&lt;\/b&gt; (x+)/)?.[1] ?? ""
    expect("<b>Bold</b> ".length + shown.length).toBe(SLOGAN_MAX_LENGTH)
  })
})

describe("buildPlainText", () => {
  it("lists the name, contacts and social links", () => {
    const text = buildPlainText(fullState)
    expect(text.split("\n")[0]).toBe("Mohammad Montasim Al Mamun Shuvo")
    expect(text).toContain("montasimmamun@gmail.com")
    expect(text).toContain("LinkedIn: linkedin.com/in/montasim")
  })

  it("joins the job title and company on one line", () => {
    expect(buildPlainText(fullState).split("\n")[1]).toBe(
      "Senior Software Engineer, Engineering at Example Co"
    )
    expect(
      buildPlainText({
        ...fullState,
        fields: { ...fullState.fields, title: "" },
      }).split("\n")[1]
    ).toBe("Engineering | Example Co")
  })

  it("puts a footer slogan last, after a blank line", () => {
    const text = buildPlainText({ ...fullState, sloganPosition: "footer" })
    expect(text.endsWith(`\n\n${SLOGAN}`)).toBe(true)
  })

  it("puts an under-name slogan in the name block", () => {
    const lines = buildPlainText({
      ...fullState,
      sloganPosition: "name",
    }).split("\n")
    expect(lines.indexOf(SLOGAN)).toBe(lines.indexOf("He / Him") + 1)
  })
})
