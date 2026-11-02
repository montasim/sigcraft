import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Copy01Icon, Icon } from "@/components/icons"
import { copyHtml, copyText } from "@/lib/clipboard"
import { GMAIL_SIGNATURE_LIMIT, SITE_URL } from "./config"
import type { SignatureState } from "./config"
import { buildPlainText, buildSignature } from "./build-signature"

const GMAIL_STEPS = [
  <>
    In Gmail, open <b>Settings → See all settings</b>.
  </>,
  <>
    On <b>General</b>, scroll to <b>Signature</b> and click <b>Create new</b>.
  </>,
  <>
    Click in the editor box and press <b>Ctrl + V</b>. Don't use “paste as plain
    text”.
  </>,
  <>
    Under <b>Signature defaults</b>, choose it for new emails and for replies.
  </>,
  <>
    Tick <b>Insert signature before quoted text</b>. This also removes the “--”
    line Gmail adds above it.
  </>,
  <>
    Click <b>Save Changes</b> at the bottom of the settings page.
  </>,
]

export function CreateSignatureDialog({
  open,
  onOpenChange,
  state,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  state: SignatureState
}) {
  const html = buildSignature(state, "copy")
  const over = html.length > GMAIL_SIGNATURE_LIMIT

  const run = async (label: string, copy: () => Promise<boolean>) => {
    if (await copy()) toast.success(`${label} copied`)
    else
      toast.error(
        "Your browser blocked copying. Try again, or use another browser."
      )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl font-normal">
            Your signature is ready
          </DialogTitle>
          <DialogDescription>
            Copy it, then paste it into Gmail's signature box.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="lg"
            onClick={() => run("Signature", () => copyHtml(html))}
          >
            <Icon icon={Copy01Icon} data-icon="inline-start" />
            Copy signature
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => run("HTML", () => copyText(html))}
          >
            Copy HTML
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() =>
              run("Plain text", () => copyText(buildPlainText(state)))
            }
          >
            Copy plain text
          </Button>
          <Badge
            variant={over ? "destructive" : "secondary"}
            className="ml-auto font-mono tabular-nums"
            title="Gmail rejects signatures longer than 10,000 characters"
          >
            {html.length.toLocaleString()} /{" "}
            {GMAIL_SIGNATURE_LIMIT.toLocaleString()}
          </Badge>
        </div>
        <Separator />
        <ol className="flex flex-col gap-2.5">
          {GMAIL_STEPS.map((step, i) => (
            <li
              key={i}
              className="grid grid-cols-[24px_1fr] gap-2.5 text-sm text-muted-foreground [&_b]:font-semibold [&_b]:text-foreground"
            >
              <span className="grid size-6 place-items-center rounded-full bg-secondary font-mono text-xs font-semibold text-foreground">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <DialogFooter className="text-xs text-muted-foreground sm:justify-start">
          Your photo and icons load from {SITE_URL}. Keep that site online, or
          the images in your signature will break. Outlook on Windows shows
          round images as squares.
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
