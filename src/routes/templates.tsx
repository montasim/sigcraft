import { createFileRoute } from "@tanstack/react-router"
import { EmailTemplatesPage } from "@/features/email-templates/email-templates-page"
import { pageHead } from "@/lib/site"

export const Route = createFileRoute("/templates")({
  head: () =>
    pageHead({
      title: "Email templates · Sigcraft",
      description:
        "Eight ready-to-send email templates for job applications, recruiters, follow-ups, referrals, client inquiries and meeting requests.",
      path: "/templates",
    }),
  component: EmailTemplatesPage,
})
