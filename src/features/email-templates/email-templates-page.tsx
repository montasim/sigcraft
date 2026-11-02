import { Fragment, useState } from "react"
import type { ChangeEvent } from "react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { TabsContent } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  EditorLayout,
  EditorRail,
  EditorSidebar,
  EditorStage,
  StepNav,
} from "@/components/editor-layout"
import {
  Briefcase01Icon,
  Building03Icon,
  Calendar03Icon,
  Clock01Icon,
  Copy01Icon,
  Icon,
  Layout01Icon,
  Link01Icon,
  MailSend01Icon,
  Refresh01Icon,
  UserGroupIcon,
  UserIcon,
} from "@/components/icons"
import type { IconGlyph } from "@/components/icons"
import { usePersistentState } from "@/hooks/use-persistent-state"
import { copyText } from "@/lib/clipboard"
import { cn } from "@/lib/utils"
import { CreateEmailDialog } from "./create-email-dialog"
import { EMAIL_TEMPLATES } from "./data"
import type { EmailCategory } from "./data"
import {
  DEFAULT_FIELD_VALUES,
  FIELD_META,
  fieldLabel,
  fillText,
  missingFields,
  segments,
  templateFields,
} from "./email-fields"

// Icons only for details with a clear kind; free-text details stay plain.
function fieldIcon(key: string): IconGlyph | undefined {
  if (key === "Name") return UserIcon
  if (key === "Company") return Building03Icon
  if (key === "Role") return Briefcase01Icon
  if (key === "Job link") return Link01Icon
  if (/time/i.test(key)) return Clock01Icon
  if (/day|date/i.test(key)) return Calendar03Icon
  return undefined
}

const CATEGORY_ICONS: Record<EmailCategory, IconGlyph> = {
  "Job search": Briefcase01Icon,
  Clients: UserGroupIcon,
  General: Calendar03Icon,
}
const CATEGORIES = Object.keys(CATEGORY_ICONS) as EmailCategory[]

// The template decides which details are asked for, so it comes first.
const STEPS = [
  { id: "templates", name: "Templates", icon: Layout01Icon },
  { id: "details", name: "Details", icon: UserIcon },
] as const
type StepId = (typeof STEPS)[number]["id"]

const STEP_TEXT: Record<
  StepId,
  { kicker: string; title: string; note: string }
> = {
  templates: {
    kicker: "Step 1: Templates",
    title: "Choose an email",
    note: "The next step asks only for the details this email needs.",
  },
  details: {
    kicker: "Step 2: Details",
    title: "Fill in your details",
    note: "Type each detail once. Every template that uses it updates.",
  },
}

// Keeps only string values from whatever this browser saved earlier.
function restoreValues(saved: unknown): Record<string, string> {
  if (!saved || typeof saved !== "object") return DEFAULT_FIELD_VALUES
  // Defaults go first, so a field saved before it had a default still gets one.
  return {
    ...DEFAULT_FIELD_VALUES,
    ...Object.fromEntries(
      Object.entries(saved).filter(
        (entry): entry is [string, string] => typeof entry[1] === "string"
      )
    ),
  }
}

// Filled values get a soft underline; empty placeholders stay highlighted.
function FilledText({
  text,
  values,
}: {
  text: string
  values: Partial<Record<string, string>>
}) {
  return segments(text, values).map((part, i) =>
    part.kind === "text" ? (
      <Fragment key={i}>{part.text}</Fragment>
    ) : part.kind === "filled" ? (
      <span
        key={i}
        className="underline decoration-primary/40 decoration-2 underline-offset-4"
      >
        {part.text}
      </span>
    ) : (
      <mark
        key={i}
        className="rounded bg-highlight px-0.5 text-highlight-foreground"
      >
        {part.text}
      </mark>
    )
  )
}

export function EmailTemplatesPage() {
  const [step, setStep] = useState<StepId>("templates")
  const index = STEPS.findIndex((s) => s.id === step)
  const [current, setCurrent] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [values, setValues] = usePersistentState(
    "sigcraft:email-fields:v1",
    DEFAULT_FIELD_VALUES,
    restoreValues
  )
  const t = EMAIL_TEMPLATES[current]
  const { common, own } = templateFields(t)
  const missing = missingFields(t, values)
  const total = common.length + own.length

  const setValue = (key: string, value: string) =>
    setValues((v) => ({ ...v, [key]: value }))

  const copy = async (label: string, text: string) => {
    if (!(await copyText(fillText(text, values)))) {
      toast.error(
        "Your browser blocked copying. Try again, or use another browser."
      )
      return
    }
    if (missing.length)
      toast.success(`${label} copied`, {
        description: `${missing.length} highlighted ${missing.length === 1 ? "part is" : "parts are"} still empty.`,
      })
    else toast.success(`${label} copied`)
  }

  const fieldInput = (key: string) => {
    const icon = fieldIcon(key)
    const control = {
      id: `ef-${key}`,
      value: values[key] ?? "",
      placeholder: FIELD_META[key]?.example,
      onChange: (e: ChangeEvent<HTMLInputElement>) =>
        setValue(key, e.target.value),
      autoComplete: "off",
    }
    return (
      <Field key={key}>
        <FieldLabel htmlFor={`ef-${key}`}>{fieldLabel(key)}</FieldLabel>
        {icon ? (
          <InputGroup>
            <InputGroupInput {...control} />
            <InputGroupAddon>
              <Icon icon={icon} />
            </InputGroupAddon>
          </InputGroup>
        ) : (
          <Input {...control} />
        )}
      </Field>
    )
  }

  return (
    <EditorLayout value={step} onValueChange={(v) => setStep(v as StepId)}>
      <EditorRail label="Email template steps" steps={STEPS} />

      <EditorSidebar
        kicker={STEP_TEXT[step].kicker}
        title={STEP_TEXT[step].title}
        note={STEP_TEXT[step].note}
        footer={
          <StepNav
            index={index}
            count={STEPS.length}
            onStep={(i) => setStep(STEPS[i].id)}
            lastLabel="Create email"
            lastIcon={MailSend01Icon}
            onLast={() => setDialogOpen(true)}
          />
        }
      >
        <TabsContent value="details" className="mt-0 flex flex-col gap-6">
          <div className="flex items-center justify-between gap-3 rounded-lg border bg-secondary py-1.5 pr-1.5 pl-3">
            <span className="text-sm text-muted-foreground tabular-nums">
              {total - missing.length} of {total} filled for this email
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setValues(DEFAULT_FIELD_VALUES)}
            >
              <Icon icon={Refresh01Icon} data-icon="inline-start" />
              Clear details
            </Button>
          </div>
          {common.length ? (
            <FieldSet>
              <FieldLegend variant="label">Used in most emails</FieldLegend>
              <FieldGroup className="gap-4">
                {common.map(fieldInput)}
              </FieldGroup>
            </FieldSet>
          ) : null}
          <FieldSet>
            <FieldLegend variant="label">For “{t.title}”</FieldLegend>
            {own.length ? (
              <FieldGroup className="gap-4">{own.map(fieldInput)}</FieldGroup>
            ) : (
              <FieldDescription>
                This email doesn't need anything else.
              </FieldDescription>
            )}
          </FieldSet>
        </TabsContent>

        <TabsContent value="templates" className="mt-0 flex flex-col gap-5">
          {CATEGORIES.map((cat) => (
            <div key={cat} className="flex flex-col gap-2">
              <div className="flex items-center gap-2 font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
                <Icon icon={CATEGORY_ICONS[cat]} className="size-3.5" />
                {cat}
              </div>
              <ToggleGroup
                type="single"
                orientation="vertical"
                spacing={2}
                value={String(current)}
                onValueChange={(v) => v && setCurrent(Number(v))}
                className="w-full"
                aria-label={`${cat} templates`}
              >
                {EMAIL_TEMPLATES.map((item, i) =>
                  item.category === cat ? (
                    <ToggleGroupItem
                      key={item.title}
                      value={String(i)}
                      variant="outline"
                      className="h-auto w-full flex-col items-start gap-0.5 px-3 py-2.5 text-left whitespace-normal"
                    >
                      <span className="text-sm font-semibold">
                        {item.title}
                      </span>
                      <span className="text-xs font-normal text-muted-foreground">
                        {item.when}
                      </span>
                    </ToggleGroupItem>
                  ) : null
                )}
              </ToggleGroup>
            </div>
          ))}
        </TabsContent>
      </EditorSidebar>

      <EditorStage label="Email">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-8 sm:px-8">
          <Card className="gap-0 pb-0">
            <CardHeader className="gap-2 border-b pb-5">
              <Badge variant="secondary" className="w-fit gap-1.5">
                <Icon icon={CATEGORY_ICONS[t.category]} className="size-3.5" />
                {t.category}
              </Badge>
              <CardTitle className="font-heading text-2xl font-normal">
                {t.title}
              </CardTitle>
              <CardDescription>{t.when}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 py-5">
              <div className="flex items-center gap-3 rounded-lg border bg-secondary py-2 pr-2 pl-3.5">
                <span className="shrink-0 font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
                  Subject
                </span>
                <span className="min-w-0 flex-1 font-semibold break-words">
                  <FilledText text={t.subject} values={values} />
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Copy subject"
                  onClick={() => copy("Subject", t.subject)}
                >
                  <Icon icon={Copy01Icon} />
                </Button>
              </div>
              <div className="max-w-[70ch] text-[15px] leading-relaxed break-words whitespace-pre-wrap">
                <FilledText text={t.body} values={values} />
              </div>
            </CardContent>
            <CardFooter className="flex-wrap justify-between gap-3 bg-transparent">
              <p
                className={cn(
                  "text-sm",
                  missing.length ? "text-muted-foreground" : "text-foreground"
                )}
              >
                {missing.length ? (
                  <>
                    Fill in the{" "}
                    <mark className="rounded bg-highlight px-0.5 text-highlight-foreground">
                      highlighted
                    </mark>{" "}
                    {missing.length === 1 ? "part" : `${missing.length} parts`}{" "}
                    in the sidebar.
                  </>
                ) : (
                  "Ready to send. Gmail adds your signature after “Best regards,”."
                )}
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Icon icon={MailSend01Icon} data-icon="inline-start" />
                Create email
              </Button>
            </CardFooter>
          </Card>
        </div>
      </EditorStage>

      <CreateEmailDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        template={t}
        values={values}
      />
    </EditorLayout>
  )
}
