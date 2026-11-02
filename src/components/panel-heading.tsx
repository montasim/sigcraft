import type { ReactNode } from "react"

// The fixed header at the top of an editor sidebar: a small kicker, a serif
// title and an optional note. Content below it scrolls on its own.
export function PanelHeading({
  kicker,
  title,
  children,
}: {
  kicker: string
  title: string
  children?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1 border-b px-6 pt-6 pb-4">
      <span className="text-xs font-medium text-muted-foreground">
        {kicker}
      </span>
      <h2 className="font-heading text-2xl font-normal tracking-tight text-balance">
        {title}
      </h2>
      {children ? (
        <p className="text-sm text-muted-foreground">{children}</p>
      ) : null}
    </div>
  )
}
