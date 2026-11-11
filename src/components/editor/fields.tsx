import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export function Section({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("border-b border-line px-3.5 py-3", className)}>
      <h3 className="text-[11px] font-medium text-faint">
        {title}
      </h3>
      <div className="mt-2 space-y-0.5">{children}</div>
    </section>
  );
}

export function Field({
  label,
  children,
  align = "center",
}: {
  label: string;
  children: ReactNode;
  align?: "center" | "start";
}) {
  return (
    <div className="flex min-h-8 items-center justify-between gap-2 py-0.5">
      <span className="text-[12px] text-muted">{label}</span>
      <div className={cn("w-[112px] shrink-0", align === "start" && "w-auto")}>
        {children}
      </div>
    </div>
  );
}

const inputClass =
  "h-7 w-full rounded border border-line bg-raised px-2 mono text-[11px] text-ink outline-none transition-colors focus:border-line-strong";

export function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}) {
  return (
    <Field label={label}>
      <div className="relative">
        <input
          type="number"
          value={Number.isFinite(value) ? value : 0}
          min={min}
          max={max}
          step={step}
          onChange={(event) => {
            const next = Number.parseFloat(event.target.value);
            if (Number.isFinite(next)) onChange(next);
          }}
          className={cn(inputClass, suffix ? "pr-6" : "")}
          aria-label={label}
        />
        {suffix ? (
          <span className="mono pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-[9px] text-faint">
            {suffix}
          </span>
        ) : null}
      </div>
    </Field>
  );
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <Field label={label}>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={cn(inputClass, "font-sans")}
        aria-label={label}
      />
    </Field>
  );
}

export function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex min-h-8 items-center justify-between gap-2 py-0.5">
      <span className="text-[12px] text-muted">{label}</span>
      <div className="flex w-[112px] items-center gap-1.5">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          className="size-7 shrink-0 rounded"
          aria-label={`${label}, pilih warna`}
        />
        <span className="mono w-full rounded border border-line bg-raised px-1.5 py-1 text-[10px] text-muted">
          {value.toUpperCase()}
        </span>
      </div>
    </div>
  );
}

export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <Field label={label}>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className={cn(inputClass, "cursor-pointer font-sans")}
        aria-label={label}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function SegmentedField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <Field label={label}>
      <fieldset
        className="flex overflow-hidden rounded border border-line"
      >
        <legend className="sr-only">{label}</legend>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={value === option.value}
            className={cn(
              "h-7 flex-1 px-1 text-[10px] font-medium transition-colors",
              value === option.value
                ? "bg-accent/15 text-ink"
                : "bg-raised text-muted hover:text-ink"
            )}
          >
            {option.label}
          </button>
        ))}
      </fieldset>
    </Field>
  );
}
