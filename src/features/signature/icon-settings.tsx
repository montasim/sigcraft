import { useEffect, useState } from "react"
import type { Dispatch, SetStateAction } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { ArrowRight01Icon, Icon } from "@/components/icons"
import { COLORS } from "./config"
import type { SignatureState } from "./config"
import {
  CONTACT_ICON_KEYS,
  CONTACT_ICON_STYLES,
  ICON_LABELS,
  SOCIAL_ICON_KEYS,
  SOCIAL_ICON_STYLES,
  iconPath,
  isHexColor,
} from "./icon-styles"
import type {
  ContactIconStyle,
  IconKey,
  IconStyle,
  SocialIconStyle,
} from "./icon-styles"

type Props = {
  state: SignatureState
  setState: Dispatch<SetStateAction<SignatureState>>
}

/* ---------- theme colour: quick picks plus any hex ---------- */

export function ThemeColorField({ state, setState }: Props) {
  const [draft, setDraft] = useState(state.color)
  useEffect(() => setDraft(state.color), [state.color])
  const preset = Object.entries(COLORS).find(
    ([, c]) => c.hex === state.color.toLowerCase()
  )
  const setColor = (hex: string) =>
    setState((s) => ({ ...s, color: hex.toLowerCase() }))
  const draftValid = isHexColor(draft)

  return (
    <Field data-invalid={!draftValid || undefined}>
      <FieldLabel htmlFor="f-themecolor">Theme colour</FieldLabel>
      <ToggleGroup
        type="single"
        spacing={2}
        value={preset?.[0] ?? ""}
        onValueChange={(id) =>
          id && setColor(COLORS[id as keyof typeof COLORS].hex)
        }
        className="flex-wrap"
        aria-label="Theme colour presets"
      >
        {Object.entries(COLORS).map(([id, c]) => (
          <ToggleGroupItem
            key={id}
            value={id}
            aria-label={c.name}
            title={c.name}
            className="size-8 min-w-0 rounded-full p-0 ring-offset-2 ring-offset-background data-[state=on]:ring-2 data-[state=on]:ring-foreground"
            style={{ backgroundColor: c.hex }}
          />
        ))}
      </ToggleGroup>
      <div className="flex items-center gap-2">
        <Input
          type="color"
          aria-label="Pick any theme colour"
          value={state.color}
          onChange={(e) => setColor(e.target.value)}
          className="size-9 shrink-0 cursor-pointer rounded-full p-1"
        />
        <Input
          id="f-themecolor"
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value)
            if (isHexColor(e.target.value)) setColor(e.target.value)
          }}
          spellCheck={false}
          aria-invalid={!draftValid || undefined}
          className="font-mono"
        />
        <Badge variant="secondary" className="shrink-0">
          {preset ? preset[1].name : "Custom"}
        </Badge>
      </div>
      <FieldDescription>
        {draftValid
          ? "Used for icons, dividers and the button. Pick a preset or any colour."
          : "Use a hex colour like #ff4800."}
      </FieldDescription>
    </Field>
  )
}

/* ---------- icon style presets ---------- */

function StylePicker<T extends IconStyle>({
  label,
  styles,
  value,
  onChange,
  sampleKeys,
  color,
}: {
  label: string
  styles: Record<T, string>
  value: T
  onChange: (v: T) => void
  sampleKeys: readonly IconKey[]
  color: string
}) {
  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <ToggleGroup
        type="single"
        spacing={2}
        value={value}
        onValueChange={(v) => v && onChange(v as T)}
        className="grid w-full grid-cols-2"
        aria-label={label}
      >
        {(Object.keys(styles) as T[]).map((style) => (
          <ToggleGroupItem
            key={style}
            value={style}
            variant="outline"
            className="h-auto flex-col items-start gap-2 px-3 py-2.5"
          >
            <span className="flex gap-1.5" aria-hidden="true">
              {sampleKeys.map((key) => (
                // A rendered icon PNG; there is no shadcn image component.
                <img
                  key={key}
                  src={iconPath(style, color, key)}
                  alt=""
                  width={20}
                  height={20}
                  className="size-5"
                />
              ))}
            </span>
            <span className="text-xs font-medium">{styles[style]}</span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </Field>
  )
}

export function IconStyleFields({ state, setState }: Props) {
  const color = isHexColor(state.color) ? state.color : COLORS.orange.hex
  return (
    <>
      <StylePicker<ContactIconStyle>
        label="Contact icon style"
        styles={CONTACT_ICON_STYLES}
        value={state.contactIconStyle}
        onChange={(v) => setState((s) => ({ ...s, contactIconStyle: v }))}
        sampleKeys={["mobile", "email", "web"]}
        color={color}
      />
      <StylePicker<SocialIconStyle>
        label="Social icon style"
        styles={SOCIAL_ICON_STYLES}
        value={state.socialIconStyle}
        onChange={(v) => setState((s) => ({ ...s, socialIconStyle: v }))}
        sampleKeys={["linkedin", "github", "youtube"]}
        color={color}
      />
    </>
  )
}

/* ---------- optional custom icon URLs ---------- */

type Check = "empty" | "loading" | "ok" | "error" | "svg" | "not-square"

// Loads the image in the browser to catch the problems that would break it in
// Gmail: a dead link, an SVG file, or a non-square picture.
function useImageCheck(url: string): Check {
  const [check, setCheck] = useState<Check>("empty")
  useEffect(() => {
    const value = url.trim()
    if (!value) return setCheck("empty")
    if (/\.svg(\?|#|$)/i.test(value)) return setCheck("svg")
    setCheck("loading")
    const img = new Image()
    let cancelled = false
    img.onload = () => {
      if (cancelled) return
      const ratio = img.naturalWidth / Math.max(img.naturalHeight, 1)
      setCheck(ratio > 1.1 || ratio < 0.9 ? "not-square" : "ok")
    }
    img.onerror = () => !cancelled && setCheck("error")
    img.src = /^https?:\/\//i.test(value) ? value : `https://${value}`
    return () => {
      cancelled = true
    }
  }, [url])
  return check
}

const CHECK_MESSAGES: Partial<Record<Check, string>> = {
  loading: "Checking the image…",
  ok: "Looks good.",
  error: "This image didn't load. Check the address is public and correct.",
  svg: "Gmail doesn't show SVG images. Use a PNG or JPG.",
  "not-square": "This image isn't square, so it will look stretched.",
}

function CustomIconField({
  iconKey,
  value,
  onChange,
}: {
  iconKey: IconKey
  value: string
  onChange: (v: string) => void
}) {
  const check = useImageCheck(value)
  const problem = check === "error" || check === "svg" || check === "not-square"
  return (
    <Field data-invalid={problem || undefined}>
      <FieldLabel htmlFor={`icon-${iconKey}`}>
        {ICON_LABELS[iconKey]}
      </FieldLabel>
      <Input
        id={`icon-${iconKey}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://…/icon.png"
        autoComplete="off"
        spellCheck={false}
        aria-invalid={problem || undefined}
      />
      {CHECK_MESSAGES[check] ? (
        <FieldDescription>{CHECK_MESSAGES[check]}</FieldDescription>
      ) : null}
    </Field>
  )
}

export function CustomIconsSection({ state, setState }: Props) {
  const count = Object.values(state.customIcons).filter((v) => v.trim()).length
  const set = (key: IconKey, value: string) =>
    setState((s) => ({ ...s, customIcons: { ...s.customIcons, [key]: value } }))

  return (
    <Collapsible className="rounded-lg border">
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="group/custom h-auto w-full justify-start gap-2 px-3 py-3 font-medium"
        >
          <Icon
            icon={ArrowRight01Icon}
            data-icon="inline-start"
            className="transition-transform group-data-[state=open]/custom:rotate-90"
          />
          Use your own icons
          {count ? (
            <Badge variant="secondary" className="ml-auto">
              {count} custom
            </Badge>
          ) : null}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="flex flex-col gap-4 border-t px-3 py-4">
          <FieldDescription>
            Paste a public PNG or JPG address to replace an icon. Leave a field
            empty to keep the drawn icon. The image must stay online, or it will
            break in every email you've sent.
          </FieldDescription>
          <FieldGroup className="grid grid-cols-1 gap-4">
            {[...CONTACT_ICON_KEYS, ...SOCIAL_ICON_KEYS].map((key) => (
              <CustomIconField
                key={key}
                iconKey={key}
                value={state.customIcons[key]}
                onChange={(v) => set(key, v)}
              />
            ))}
          </FieldGroup>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
