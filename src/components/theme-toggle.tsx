import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ComputerIcon, Icon, Moon02Icon, Sun03Icon } from "@/components/icons"
import { useTheme } from "@/components/theme-provider"
import type { Theme } from "@/components/theme-provider"

const OPTIONS = [
  { value: "light", label: "Light", icon: Sun03Icon },
  { value: "dark", label: "Dark", icon: Moon02Icon },
  { value: "system", label: "System", icon: ComputerIcon },
] as const

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Change theme">
          <Icon icon={resolvedTheme === "dark" ? Moon02Icon : Sun03Icon} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-36">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(v) => setTheme(v as Theme)}
        >
          {OPTIONS.map((o) => (
            <DropdownMenuRadioItem key={o.value} value={o.value}>
              <Icon icon={o.icon} />
              {o.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
