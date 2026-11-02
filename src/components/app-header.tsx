import { Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import {
  Icon,
  MailEdit01Icon,
  MailSend01Icon,
  Pen01Icon,
} from "@/components/icons"
import { ThemeToggle } from "@/components/theme-toggle"

const NAV = [
  { to: "/", label: "Signature", icon: Pen01Icon },
  { to: "/templates", label: "Email templates", icon: MailEdit01Icon },
] as const

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-4 border-b bg-background/95 px-4 backdrop-blur">
      <Link to="/" className="flex items-center gap-2.5">
        <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
          <Icon icon={MailSend01Icon} className="size-[18px]" />
        </span>
        <span className="flex flex-col leading-tight">
          <span className="text-[15px] font-semibold tracking-tight">
            Sigcraft
          </span>
          <span className="hidden text-xs text-muted-foreground sm:block">
            Email signatures and templates
          </span>
        </span>
      </Link>
      <div className="flex items-center gap-2">
        <nav
          aria-label="Main"
          className="flex items-center gap-1 rounded-lg border bg-card p-1"
        >
          {NAV.map((item) => (
            <Button
              key={item.to}
              asChild
              variant="ghost"
              size="sm"
              className="data-[status=active]:bg-accent data-[status=active]:text-accent-foreground"
            >
              <Link
                to={item.to}
                activeOptions={{ exact: true, includeSearch: false }}
              >
                <Icon icon={item.icon} data-icon="inline-start" />
                <span className="max-sm:sr-only">{item.label}</span>
              </Link>
            </Button>
          ))}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  )
}
