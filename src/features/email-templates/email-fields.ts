import { DEFAULT_STATE } from "@/features/signature/config"
import type { EmailTemplate } from "./data"

// Placeholders are written in templates as "[Label]". The same label means the
// same value everywhere, so one input fills every template that uses it.

// Shown for every template, in this order.
export const COMMON_FIELDS = ["Name", "Company", "Role"] as const

// The same name and role as the default signature.
const SIGNATURE = DEFAULT_STATE.fields
const DEFAULT_NAME = `${SIGNATURE.first} ${SIGNATURE.last}`

// Friendlier labels and example values for the inputs. Labels not listed here
// use the placeholder text itself.
export const FIELD_META: Partial<
  Record<string, { label?: string; example: string }>
> = {
  Name: { label: "Name", example: DEFAULT_NAME },
  Company: { label: "Company", example: "Acme" },
  Role: { label: "Role", example: SIGNATURE.title },
  "First day": { example: "Tuesday" },
  "Second day": { example: "Wednesday" },
  "Start time": { example: "10:00 AM" },
  "End time": { example: "4:00 PM" },
  "Application date": { example: "3 November" },
  "something specific about the team or product": {
    label: "What interests you about the team",
    example: "your work on real-time collaboration",
  },
  "topic you discussed": {
    label: "Topic you discussed",
    example: "how the team ships weekly",
  },
  "specific challenge they mentioned": {
    label: "Challenge they mentioned",
    example: "scaling the dashboard",
  },
  "one-line example from your experience": {
    label: "Example from your experience",
    example: "cutting load times by 40%",
  },
  "Job link": { example: "https://acme.com/jobs/123" },
  "Project name": { example: "Customer portal" },
  "one-line summary of what they want": {
    label: "What they want, in one line",
    example: "a booking app for your clinic",
  },
  topic: { label: "Topic", example: "the Q1 roadmap" },
  "First day and date": { example: "Tuesday, 12 November" },
  "First time": { example: "10:00 AM" },
  "Second day and date": { example: "Thursday, 14 November" },
  "Second time": { example: "3:00 PM" },
}

export const DEFAULT_FIELD_VALUES: Record<string, string> = {
  Name: DEFAULT_NAME,
  Role: SIGNATURE.title,
}

export const fieldLabel = (key: string) => FIELD_META[key]?.label ?? key

const PLACEHOLDER = /\[([^\]]+)\]/g

/** Placeholder labels used by a template, in order of first appearance. */
export function placeholders(template: EmailTemplate) {
  const seen = new Set<string>()
  for (const text of [template.subject, template.body])
    for (const m of text.matchAll(PLACEHOLDER)) seen.add(m[1])
  return [...seen]
}

/**
 * Fields a template uses, split into the shared ones (in COMMON_FIELDS order)
 * and the ones only this template needs.
 */
export function templateFields(template: EmailTemplate) {
  const used = placeholders(template)
  const isCommon = (key: string) =>
    (COMMON_FIELDS as readonly string[]).includes(key)
  return {
    common: COMMON_FIELDS.filter((key) => used.includes(key)) as string[],
    own: used.filter((key) => !isCommon(key)),
  }
}

/** Replaces each "[Label]" that has a value; empty ones stay as "[Label]". */
export function fillText(
  text: string,
  values: Partial<Record<string, string>>
) {
  return text.replace(PLACEHOLDER, (match, key: string) => {
    const value = values[key]?.trim()
    return value ? value : match
  })
}

/** Placeholders in a template that still have no value. */
export function missingFields(
  template: EmailTemplate,
  values: Partial<Record<string, string>>
) {
  return placeholders(template).filter((key) => !values[key]?.trim())
}

/**
 * Splits text into plain parts, filled values and still-empty placeholders,
 * so the page can highlight each kind.
 */
export function segments(
  text: string,
  values: Partial<Record<string, string>>
) {
  const parts: Array<{ kind: "text" | "filled" | "empty"; text: string }> = []
  let last = 0
  for (const m of text.matchAll(PLACEHOLDER)) {
    if (m.index > last)
      parts.push({ kind: "text", text: text.slice(last, m.index) })
    const value = values[m[1]]?.trim()
    parts.push(
      value ? { kind: "filled", text: value } : { kind: "empty", text: m[0] }
    )
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push({ kind: "text", text: text.slice(last) })
  return parts
}
