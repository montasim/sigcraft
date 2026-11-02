import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft01Icon, ArrowRight01Icon, Icon } from "@/components/icons"
import type { IconGlyph } from "@/components/icons"
import { PanelHeading } from "@/components/panel-heading"

/*
 * The shared editor shell used by the signature generator and the email
 * templates page: an icon rail of steps, a sidebar with a fixed header and
 * footer around scrolling content, and a stage that scrolls on its own.
 * On large screens it fills the viewport below the app header; on small
 * screens everything stacks and the page scrolls normally, with the stage
 * above the sidebar.
 */

type Step = {
  id: string
  name: string
  icon: IconGlyph
}

export function EditorLayout({
  value,
  onValueChange,
  children,
}: {
  value: string
  onValueChange: (value: string) => void
  children: ReactNode
}) {
  return (
    <Tabs
      value={value}
      onValueChange={onValueChange}
      orientation="vertical"
      className="grid gap-0 max-lg:grid-cols-[minmax(0,1fr)] lg:h-[calc(100dvh-3.5rem)] lg:grid-cols-[80px_minmax(0,420px)_minmax(0,1fr)] lg:overflow-hidden"
    >
      {children}
    </Tabs>
  )
}

export function EditorRail({
  label,
  steps,
}: {
  label: string
  steps: ReadonlyArray<Step>
}) {
  return (
    <TabsList
      aria-label={label}
      className="h-auto w-full flex-row! items-stretch justify-start gap-0 rounded-none border-b bg-background p-0 lg:h-full lg:flex-col! lg:justify-start lg:border-r lg:border-b-0"
    >
      {steps.map((s) => (
        <TabsTrigger
          key={s.id}
          value={s.id}
          // Uses the primitive's own data-active variants so these override
          // its defaults; the orange bar sits below (mobile) or left (lg).
          className="h-auto flex-1 flex-col gap-1.5 rounded-none border-0 py-4 text-xs font-medium text-muted-foreground shadow-none after:hidden lg:flex-none lg:border-b data-active:bg-card data-active:text-brand-ink data-active:shadow-[inset_0_-2px_0_var(--primary)]! lg:data-active:shadow-[inset_2px_0_0_var(--primary)]! dark:data-active:border-border dark:data-active:bg-card dark:data-active:text-brand-ink"
        >
          <Icon icon={s.icon} className="size-5" />
          {s.name}
        </TabsTrigger>
      ))}
    </TabsList>
  )
}

export function EditorSidebar({
  kicker,
  title,
  note,
  footer,
  children,
}: {
  kicker: string
  title: string
  note?: ReactNode
  footer: ReactNode
  children: ReactNode
}) {
  return (
    <section className="flex min-h-0 min-w-0 flex-col border-r bg-card max-lg:order-3">
      {/* Fixed header; only the content below it scrolls. */}
      <PanelHeading kicker={kicker} title={title}>
        {note}
      </PanelHeading>
      <ScrollArea type="auto" className="min-h-0 flex-1">
        <div className="p-6">{children}</div>
      </ScrollArea>
      <div className="flex items-center justify-between gap-3 border-t bg-background px-6 py-3">
        {footer}
      </div>
    </section>
  )
}

// Previous / Next links for the sidebar footer.
export function StepNav({
  index,
  count,
  onStep,
  lastLabel,
  lastIcon,
  onLast,
}: {
  index: number
  count: number
  onStep: (index: number) => void
  lastLabel: string
  lastIcon: IconGlyph
  onLast: () => void
}) {
  const isLast = index === count - 1
  return (
    <>
      <Button
        variant="link"
        className="px-0 text-foreground"
        disabled={index === 0}
        onClick={() => onStep(Math.max(0, index - 1))}
      >
        <Icon icon={ArrowLeft01Icon} data-icon="inline-start" />
        Previous
      </Button>
      <Button
        variant="link"
        className="px-0 text-foreground"
        onClick={() => (isLast ? onLast() : onStep(index + 1))}
      >
        {isLast ? (
          <>
            <Icon icon={lastIcon} data-icon="inline-start" />
            {lastLabel}
          </>
        ) : (
          <>
            Next
            <Icon icon={ArrowRight01Icon} data-icon="inline-end" />
          </>
        )}
      </Button>
    </>
  )
}

export function EditorStage({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <ScrollArea
      type="auto"
      aria-label={label}
      className="min-h-0 min-w-0 bg-stage max-lg:order-2"
    >
      {children}
    </ScrollArea>
  )
}
