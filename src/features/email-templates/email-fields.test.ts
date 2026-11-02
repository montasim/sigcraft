import { describe, expect, it } from "vitest"
import { EMAIL_TEMPLATES } from "./data"
import {
  FIELD_META,
  fillText,
  missingFields,
  placeholders,
  segments,
  templateFields,
} from "./email-fields"

const byTitle = (title: string) => {
  const t = EMAIL_TEMPLATES.find((x) => x.title === title)
  if (!t) throw new Error(`No template "${title}"`)
  return t
}

describe("email template fields", () => {
  it("gives every placeholder an example value for its input", () => {
    for (const t of EMAIL_TEMPLATES)
      for (const key of placeholders(t)) expect(FIELD_META[key]).toBeDefined()
  })

  it("never uses one placeholder for two different values in a template", () => {
    // Each repeated slot (two days, two times) has its own label.
    const recruiter = placeholders(byTitle("Replying to a recruiter"))
    expect(recruiter).toEqual(
      expect.arrayContaining([
        "First day",
        "Second day",
        "Start time",
        "End time",
      ])
    )
    const meeting = placeholders(byTitle("Requesting a meeting"))
    expect(meeting).toEqual(
      expect.arrayContaining([
        "First day and date",
        "First time",
        "Second day and date",
        "Second time",
      ])
    )
  })

  it("lists shared fields first and only the ones a template uses", () => {
    const meeting = templateFields(byTitle("Requesting a meeting"))
    expect(meeting.common).toEqual(["Name"])
    expect(meeting.own[0]).toBe("topic")
    const applying = templateFields(byTitle("Applying for a role"))
    expect(applying.common).toEqual(["Name", "Company", "Role"])
    expect(applying.own).toEqual([])
  })

  it("fills every occurrence and keeps empty placeholders", () => {
    const text = "Hi [Name], about [Company]. Thanks, [Name]. [Role]?"
    expect(fillText(text, { Name: "Sarah", Company: "  ", Role: "" })).toBe(
      "Hi Sarah, about [Company]. Thanks, Sarah. [Role]?"
    )
  })

  it("reports what is still missing", () => {
    const t = byTitle("Declining an offer")
    expect(missingFields(t, {})).toEqual(["Role", "Name", "Company"])
    expect(
      missingFields(t, { Role: "SE", Name: "Sarah", Company: "Acme" })
    ).toEqual([])
  })

  it("splits text into plain, filled and empty parts", () => {
    expect(segments("Hi [Name], at [Company].", { Name: "Sarah" })).toEqual([
      { kind: "text", text: "Hi " },
      { kind: "filled", text: "Sarah" },
      { kind: "text", text: ", at " },
      { kind: "empty", text: "[Company]" },
      { kind: "text", text: "." },
    ])
  })
})
