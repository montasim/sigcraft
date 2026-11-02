import type { ReactNode } from "react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import {
  Copy01Icon,
  FloppyDiskIcon,
  Icon,
  InformationCircleIcon,
  MailSend01Icon,
  TextIcon,
} from "@/components/icons"
import { copyText } from "@/lib/clipboard"
import type { EmailTemplate } from "./data"
import { fieldLabel, fillText, missingFields } from "./email-fields"

const SEND_STEPS = [
  <>
    In Gmail, click <b>Compose</b>.
  </>,
  <>
    Paste the subject into <b>Subject</b> and the body into the message. Gmail
    adds your signature below it.
  </>,
]

const SAVE_STEPS = [
  <>
    Open <b>Settings → See all settings → Advanced</b>, set <b>Templates</b> to{" "}
    <b>Enable</b> and click <b>Save Changes</b>.
  </>,
  <>
    Click <b>Compose</b> and paste the subject and body.
  </>,
  <>Delete the signature from the draft so it isn't saved into the template.</>,
  <>
    Click <b>⋮ → Templates → Save draft as template → Save as new template</b>.
  </>,
  <>
    To use it later: <b>Compose → ⋮ → Templates</b>, then pick it.
  </>,
]

function Steps({ steps }: { steps: ReadonlyArray<ReactNode> }) {
  return (
    <ol className="flex flex-col gap-2.5">
      {steps.map((step, i) => (
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
  )
}

export function CreateEmailDialog({
  open,
  onOpenChange,
  template,
  values,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: EmailTemplate
  values: Partial<Record<string, string>>
}) {
  const missing = missingFields(template, values)

  const copy = async (label: string, text: string) => {
    if (await copyText(fillText(text, values))) toast.success(`${label} copied`)
    else
      toast.error(
        "Your browser blocked copying. Try again, or use another browser."
      )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl font-normal">
            {missing.length ? "Almost ready" : "Your email is ready"}
          </DialogTitle>
          <DialogDescription>
            Copy the subject and body of “{template.title}”, then paste them
            into Gmail.
          </DialogDescription>
        </DialogHeader>
        {missing.length ? (
          <Alert className="border-accent bg-accent text-accent-foreground">
            <Icon icon={InformationCircleIcon} />
            <AlertTitle>
              {missing.length === 1
                ? "1 part is still empty"
                : `${missing.length} parts are still empty`}
            </AlertTitle>
            <AlertDescription className="text-accent-foreground/90">
              {missing.map(fieldLabel).join(", ")}. Fill them in Details, or
              edit them in Gmail after pasting.
            </AlertDescription>
          </Alert>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          <Button size="lg" onClick={() => copy("Email body", template.body)}>
            <Icon icon={Copy01Icon} data-icon="inline-start" />
            Copy email body
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => copy("Subject", template.subject)}
          >
            <Icon icon={TextIcon} data-icon="inline-start" />
            Copy subject
          </Button>
        </div>
        <Separator />
        <div className="flex flex-col gap-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Icon icon={MailSend01Icon} className="size-4 text-primary" />
            Send it now
          </h3>
          <Steps steps={SEND_STEPS} />
        </div>
        <div className="flex flex-col gap-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Icon icon={FloppyDiskIcon} className="size-4 text-primary" />
            Or save it as a Gmail template to reuse
          </h3>
          <Steps steps={SAVE_STEPS} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
