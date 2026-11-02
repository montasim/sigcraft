import { useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { TabsContent } from "@/components/ui/tabs"
import {
  EditorLayout,
  EditorRail,
  EditorSidebar,
  EditorStage,
  StepNav,
} from "@/components/editor-layout"
import {
  Icon,
  Image01Icon,
  InformationCircleIcon,
  Layout01Icon,
  PaintBoardIcon,
  Pen01Icon,
  Refresh01Icon,
  UserIcon,
} from "@/components/icons"
import { usePersistentState } from "@/hooks/use-persistent-state"
import { DEFAULT_STATE } from "./config"
import { buildSignature } from "./build-signature"
import { CreateSignatureDialog } from "./create-signature-dialog"
import {
  DetailsStep,
  ImagesStep,
  StylesStep,
  TemplatesStep,
} from "./editor-steps"
import { STORAGE_KEY, restoreState } from "./signature-state"

const STEPS = [
  {
    id: "details",
    name: "Details",
    icon: UserIcon,
    Panel: DetailsStep,
    kicker: "Step 1: Details",
    title: "Enter your signature details",
    note: null,
  },
  {
    id: "images",
    name: "Images",
    icon: Image01Icon,
    Panel: ImagesStep,
    kicker: "Step 2: Images",
    title: "Signature image",
    note: "Gmail can't store pictures inside a pasted signature, so it loads your photo from a web address. Your headshot is already set.",
  },
  {
    id: "templates",
    name: "Templates",
    icon: Layout01Icon,
    Panel: TemplatesStep,
    kicker: "Step 3: Templates",
    title: "Select your template",
    note: null,
  },
  {
    id: "styles",
    name: "Styles",
    icon: PaintBoardIcon,
    Panel: StylesStep,
    kicker: "Step 4: Styles",
    title: "Style your signature",
    note: null,
  },
] as const
type StepId = (typeof STEPS)[number]["id"]

export function SignatureGenerator() {
  const [state, setState] = usePersistentState(
    STORAGE_KEY,
    DEFAULT_STATE,
    restoreState
  )
  const [step, setStep] = useState<StepId>("details")
  const [dialogOpen, setDialogOpen] = useState(false)
  const index = STEPS.findIndex((s) => s.id === step)
  const current = STEPS[index]
  const noPhone = !state.fields.mobile && !state.fields.office

  return (
    <EditorLayout value={step} onValueChange={(v) => setStep(v as StepId)}>
      <EditorRail label="Signature steps" steps={STEPS} />

      <EditorSidebar
        kicker={current.kicker}
        title={current.title}
        note={current.note}
        footer={
          <StepNav
            index={index}
            count={STEPS.length}
            onStep={(i) => setStep(STEPS[i].id)}
            lastLabel="Create signature"
            lastIcon={Pen01Icon}
            onLast={() => setDialogOpen(true)}
          />
        }
      >
        {STEPS.map(({ id, Panel }) => (
          <TabsContent key={id} value={id} className="mt-0">
            <Panel state={state} setState={setState} />
          </TabsContent>
        ))}
      </EditorSidebar>

      <EditorStage label="Preview">
        <section className="flex flex-col items-center gap-6 px-4 py-8 sm:px-10">
          {noPhone ? (
            <Alert className="max-w-[820px] border-accent bg-accent text-accent-foreground">
              <Icon icon={InformationCircleIcon} />
              <AlertTitle>No phone number yet</AlertTitle>
              <AlertDescription className="text-accent-foreground/90">
                Add your mobile number in Details so people can call you.
              </AlertDescription>
            </Alert>
          ) : null}
          <MailWindow html={buildSignature(state, "preview")} />
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button variant="ghost" onClick={() => setState(DEFAULT_STATE)}>
              <Icon icon={Refresh01Icon} data-icon="inline-start" />
              Reset to my details
            </Button>
            <Button
              size="lg"
              className="h-11 px-6 text-base shadow-lg shadow-primary/25"
              onClick={() => setDialogOpen(true)}
            >
              <Icon icon={Pen01Icon} data-icon="inline-start" />
              Create signature
            </Button>
          </div>
        </section>
      </EditorStage>

      <CreateSignatureDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        state={state}
      />
    </EditorLayout>
  )
}

function MailWindow({ html }: { html: string }) {
  return (
    <div className="w-full max-w-[820px] overflow-hidden rounded-xl bg-white text-[#202124] shadow-xl ring-1 shadow-black/5 ring-black/5">
      <div
        className="flex h-8 items-center gap-1.5 bg-[#1f1f1f] px-3.5"
        aria-hidden="true"
      >
        <span className="size-2 rounded-full bg-[#ff5f57]" />
        <span className="size-2 rounded-full bg-[#febc2e]" />
        <span className="size-2 rounded-full bg-[#28c840]" />
      </div>
      <div className="border-b border-[#e8eaed] px-4 py-3 font-[Arial,Helvetica,sans-serif] text-[13px] leading-[22px]">
        <div>
          To:{" "}
          <span className="rounded-full border border-[#f7b9a1] bg-[#fcded2] px-2 text-xs leading-[18px] text-[#8a2a00]">
            Your recipient
          </span>
        </div>
        <div>
          <b>Subject:</b> Check out my new email signature
        </div>
      </div>
      <div className="flex flex-col gap-2 px-4 pt-3.5" aria-hidden="true">
        <span className="h-[7px] w-full rounded bg-[#cdd8e1]" />
        <span className="h-[7px] w-[56%] rounded bg-[#cdd8e1]" />
      </div>
      {/* Email HTML, rendered the way Gmail's compose body would show it. */}
      <div className="mail-body" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}
