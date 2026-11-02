import type { ComponentProps, Dispatch, SetStateAction } from "react"
import {
  Field,
  FieldContent,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Icon, Image01Icon, Link01Icon, Tick02Icon } from "@/components/icons"
import type { IconGlyph } from "@/components/icons"
import { cn } from "@/lib/utils"
import {
  FONTS,
  FONT_SIZES,
  PHOTO_SIZES,
  SHAPES,
  SLOGAN_MAX_LENGTH,
  SLOGAN_POSITIONS,
  SLOGAN_STYLES,
  SOCIALS,
  TEMPLATE_IDS,
  TEMPLATE_NAMES,
} from "./config"
import type {
  FontId,
  ShapeId,
  SignatureFields,
  SignatureState,
  SizeId,
  SloganPosition,
  SloganStyle,
  TemplateId,
} from "./config"
import {
  CustomIconsSection,
  IconStyleFields,
  ThemeColorField,
} from "./icon-settings"
import { FIELD_ICONS } from "./field-icons"
import { TemplateThumbnail } from "./template-thumbnail"

type StepProps = {
  state: SignatureState
  setState: Dispatch<SetStateAction<SignatureState>>
}

function useFieldSetter(setState: StepProps["setState"]) {
  return (key: keyof SignatureFields, value: string) =>
    setState((s) => ({ ...s, fields: { ...s.fields, [key]: value } }))
}

function TextField({
  id,
  label,
  description,
  className,
  invalid,
  icon,
  ...input
}: {
  id: string
  label: string
  description?: string
  invalid?: boolean
  /** Leading icon for contact details and links. */
  icon?: IconGlyph
} & ComponentProps<typeof Input>) {
  const control = {
    id,
    autoComplete: "off",
    "aria-invalid": invalid || undefined,
    ...input,
  }
  return (
    <Field className={className} data-invalid={invalid || undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
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
      {description ? <FieldDescription>{description}</FieldDescription> : null}
    </Field>
  )
}

/* ---------- Step 1: details ---------- */

export function DetailsStep({ state, setState }: StepProps) {
  const set = useFieldSetter(setState)
  const f = state.fields
  const field = (
    key: keyof SignatureFields,
    label: string,
    extra: Partial<ComponentProps<typeof TextField>> = {}
  ) => (
    <TextField
      id={`f-${key}`}
      label={label}
      value={f[key]}
      onChange={(e) => set(key, e.target.value)}
      {...extra}
    />
  )
  const noPhone = !f.mobile && !f.office

  return (
    <div className="flex flex-col gap-6">
      <FieldSet>
        <FieldLegend variant="label">About you</FieldLegend>
        <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {field("first", "First name")}
          {field("last", "Last name")}
          {field("title", "Job title")}
          {field("dept", "Department", { placeholder: "Engineering" })}
          {field("company", "Company", { placeholder: "Company name" })}
          {field("companyUrl", "Company website", {
            placeholder: "company.com",
            inputMode: "url",
            icon: Link01Icon,
            description: f.company
              ? "Links your company name."
              : "Needs a company name.",
          })}
          {field("pronouns", "Pronouns", { placeholder: "He / Him" })}
          {field("slogan", "Slogan", {
            className: "sm:col-span-2",
            placeholder: "A short line about how you work",
            maxLength: SLOGAN_MAX_LENGTH,
            description: `${f.slogan.length} / ${SLOGAN_MAX_LENGTH} characters. Leave empty to hide it. Choose where it sits in Styles.`,
          })}
        </FieldGroup>
      </FieldSet>
      <FieldSet>
        <FieldLegend variant="label">Contact</FieldLegend>
        <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {field("office", "Office phone", {
            placeholder: "+880 2 XXXX XXXX",
            inputMode: "tel",
            icon: FIELD_ICONS.phone,
          })}
          {field("mobile", "Mobile phone", {
            placeholder: "+8801722815469",
            inputMode: "tel",
            icon: FIELD_ICONS.mobile,
            invalid: noPhone,
            description: noPhone
              ? "Add a number so people can call you."
              : undefined,
          })}
          {field("web", "Website", {
            placeholder: "montasim.dev",
            icon: FIELD_ICONS.web,
          })}
          {field("email", "Email", {
            placeholder: "montasimmamun@gmail.com",
            inputMode: "email",
            icon: FIELD_ICONS.email,
          })}
          {field("address", "Address", {
            className: "sm:col-span-2",
            icon: FIELD_ICONS.location,
          })}
        </FieldGroup>
      </FieldSet>
      <FieldSet>
        <FieldLegend variant="label">Social profiles</FieldLegend>
        <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {SOCIALS.map((so) => (
            <TextField
              key={so.key}
              id={`f-${so.key}`}
              label={so.label}
              icon={FIELD_ICONS[so.key]}
              placeholder={so.placeholder}
              value={f[so.key]}
              onChange={(e) => set(so.key, e.target.value)}
            />
          ))}
        </FieldGroup>
      </FieldSet>
    </div>
  )
}

/* ---------- Step 2: images ---------- */

export function ImagesStep({ state, setState }: StepProps) {
  const set = useFieldSetter(setState)
  return (
    <div className="flex flex-col gap-6">
      <FieldGroup>
        <Field orientation="horizontal">
          <FieldContent>
            <FieldLabel htmlFor="f-showphoto">Show profile photo</FieldLabel>
            <FieldDescription>
              Turn this off for a text-only signature.
            </FieldDescription>
          </FieldContent>
          <Switch
            id="f-showphoto"
            checked={state.showPhoto}
            onCheckedChange={(v) => setState((s) => ({ ...s, showPhoto: v }))}
          />
        </Field>
        <TextField
          id="f-photo"
          label="Profile photo URL"
          icon={Image01Icon}
          description="Must be a public image address that stays online."
          value={state.fields.photo}
          onChange={(e) => set("photo", e.target.value)}
        />
        <Field>
          <FieldLabel>Shape</FieldLabel>
          <ToggleGroup
            type="single"
            variant="outline"
            value={state.shape}
            onValueChange={(v) =>
              v && setState((s) => ({ ...s, shape: v as ShapeId }))
            }
          >
            {Object.entries(SHAPES).map(([id, o]) => (
              <ToggleGroupItem key={id} value={id} className="px-3">
                {o.name}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Field>
        <Field>
          <FieldLabel>Size</FieldLabel>
          <ToggleGroup
            type="single"
            variant="outline"
            value={state.photoSize}
            onValueChange={(v) =>
              v && setState((s) => ({ ...s, photoSize: v as SizeId }))
            }
          >
            {Object.entries(PHOTO_SIZES).map(([id, o]) => (
              <ToggleGroupItem key={id} value={id} className="px-3">
                {o.name}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Field>
      </FieldGroup>
    </div>
  )
}

/* ---------- Step 3: templates ---------- */

export function TemplatesStep({ state, setState }: StepProps) {
  return (
    <div className="flex flex-col gap-6">
      <ToggleGroup
        type="single"
        spacing={3}
        value={String(state.template)}
        onValueChange={(v) =>
          v && setState((s) => ({ ...s, template: Number(v) as TemplateId }))
        }
        className="grid w-full grid-cols-2"
        aria-label="Template"
      >
        {TEMPLATE_IDS.map((id) => (
          <ToggleGroupItem
            key={id}
            value={String(id)}
            aria-label={TEMPLATE_NAMES[id]}
            className="group/tpl relative h-auto flex-col items-stretch gap-2 rounded-xl p-0 hover:bg-transparent data-[state=on]:bg-transparent"
          >
            <span className="text-left text-sm font-semibold">
              {TEMPLATE_NAMES[id]}
            </span>
            <span className="relative rounded-lg bg-card p-3 ring-1 ring-border transition-shadow group-data-[state=on]/tpl:ring-3 group-data-[state=on]/tpl:ring-primary">
              <TemplateThumbnail id={id} />
              <span className="absolute top-1/2 left-1/2 hidden size-7 -translate-1/2 place-items-center rounded-full bg-primary text-primary-foreground group-data-[state=on]/tpl:grid">
                <Icon icon={Tick02Icon} className="size-4" strokeWidth={2.4} />
              </span>
            </span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}

/* ---------- Step 4: styles ---------- */

function ColorField({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
}) {
  const valid = /^#[0-9a-f]{6}$/i.test(value)
  return (
    <Field data-invalid={!valid || undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="flex items-center gap-2">
        <Input
          type="color"
          aria-label={`Pick ${label.toLowerCase()}`}
          value={valid ? value : "#1f2937"}
          onChange={(e) => onChange(e.target.value)}
          className="size-9 shrink-0 cursor-pointer rounded-full p-1"
        />
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          aria-invalid={!valid || undefined}
          className="font-mono"
        />
      </div>
      {!valid ? (
        <FieldDescription>Use a hex colour like #1f2937.</FieldDescription>
      ) : null}
    </Field>
  )
}

export function StylesStep({ state, setState }: StepProps) {
  const set = useFieldSetter(setState)
  return (
    <div className="flex flex-col gap-6">
      <FieldGroup>
        <ThemeColorField state={state} setState={setState} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ColorField
            id="f-textcolor"
            label="Text colour"
            value={state.fields.textColor}
            onChange={(v) => set("textColor", v)}
          />
          <ColorField
            id="f-linkcolor"
            label="Link colour"
            value={state.fields.linkColor}
            onChange={(v) => set("linkColor", v)}
          />
        </div>
        <Field>
          <FieldLabel htmlFor="f-font">Font</FieldLabel>
          <Select
            value={state.font}
            onValueChange={(v) =>
              setState((s) => ({ ...s, font: v as FontId }))
            }
          >
            <SelectTrigger id="f-font" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(FONTS).map(([id, font]) => (
                <SelectItem
                  key={id}
                  value={id}
                  style={{ fontFamily: font.stack }}
                >
                  {font.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel>Font size</FieldLabel>
          <ToggleGroup
            type="single"
            variant="outline"
            value={state.fontSize}
            onValueChange={(v) =>
              v && setState((s) => ({ ...s, fontSize: v as SizeId }))
            }
          >
            {Object.entries(FONT_SIZES).map(([id, o]) => (
              <ToggleGroupItem key={id} value={id} className="px-3">
                {o.name}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Field>
        <Field orientation="horizontal">
          <FieldContent>
            <FieldLabel htmlFor="f-showicons">Show contact icons</FieldLabel>
            <FieldDescription>
              Phone, email, website and address icons.
            </FieldDescription>
          </FieldContent>
          <Switch
            id="f-showicons"
            checked={state.showIcons}
            onCheckedChange={(v) => setState((s) => ({ ...s, showIcons: v }))}
          />
        </Field>
        <IconStyleFields state={state} setState={setState} />
        <CustomIconsSection state={state} setState={setState} />
      </FieldGroup>
      <FieldSet>
        <FieldLegend variant="label">Slogan</FieldLegend>
        <FieldDescription>
          {state.fields.slogan.trim()
            ? "The footer reads as a sign-off; under your name puts it next to your title."
            : "Add a slogan in Details to use these options."}
        </FieldDescription>
        <FieldGroup className="gap-4">
          <Field>
            <FieldLabel>Position</FieldLabel>
            <ToggleGroup
              type="single"
              variant="outline"
              value={state.sloganPosition}
              onValueChange={(v) =>
                v &&
                setState((s) => ({ ...s, sloganPosition: v as SloganPosition }))
              }
              disabled={!state.fields.slogan.trim()}
            >
              {Object.entries(SLOGAN_POSITIONS).map(([id, name]) => (
                <ToggleGroupItem key={id} value={id} className="px-3">
                  {name}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </Field>
          <Field>
            <FieldLabel>Style</FieldLabel>
            <ToggleGroup
              type="single"
              variant="outline"
              value={state.sloganStyle}
              onValueChange={(v) =>
                v && setState((s) => ({ ...s, sloganStyle: v as SloganStyle }))
              }
              disabled={!state.fields.slogan.trim()}
            >
              {Object.entries(SLOGAN_STYLES).map(([id, name]) => (
                <ToggleGroupItem key={id} value={id} className="px-3">
                  {name}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </Field>
        </FieldGroup>
      </FieldSet>
      <FieldSet>
        <FieldLegend variant="label">Call to action</FieldLegend>
        <FieldDescription>
          Leave the button text empty to hide the button.
        </FieldDescription>
        <FieldGroup className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2")}>
          <TextField
            id="f-ctatext"
            label="Button text"
            placeholder="View my portfolio"
            value={state.fields.ctaText}
            onChange={(e) => set("ctaText", e.target.value)}
          />
          <TextField
            id="f-ctaurl"
            label="Button link"
            icon={Link01Icon}
            placeholder="montasim.dev"
            value={state.fields.ctaUrl}
            onChange={(e) => set("ctaUrl", e.target.value)}
          />
        </FieldGroup>
      </FieldSet>
    </div>
  )
}
