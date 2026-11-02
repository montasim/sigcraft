import { createFileRoute } from "@tanstack/react-router"
import { SignatureGenerator } from "@/features/signature/signature-generator"
import { pageHead } from "@/lib/site"

export const Route = createFileRoute("/")({
  head: () =>
    pageHead({
      title: "Sigcraft · Gmail-ready email signature generator",
      description:
        "Build a professional email signature from 26 templates in any colour, preview it in a mail window, and copy it straight into Gmail.",
      path: "/",
    }),
  component: SignatureGenerator,
})
