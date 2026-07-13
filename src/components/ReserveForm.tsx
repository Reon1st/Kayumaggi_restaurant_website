"use client";

import { useState, useTransition } from "react";
import { Check } from "./icons";
import { submitReservation } from "@/app/actions";

type Errors = Partial<Record<"name" | "email" | "date" | "time" | "party", string>>;

const TIMES = ["6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM", "9:00 PM"];
const PARTY = ["1 guest", "2 guests", "3 guests", "4 guests", "5 guests", "6 guests", "7+ (call us)"];
const OCCASIONS = ["—", "Anniversary", "Birthday", "Business", "Celebration", "Just because"];

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const today = new Date().toISOString().split("T")[0];

export default function ReserveForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function validate(form: HTMLFormElement): Errors {
    const data = new FormData(form);
    const e: Errors = {};
    if (!String(data.get("name") ?? "").trim()) e.name = "Please tell us your name.";
    const email = String(data.get("email") ?? "").trim();
    if (!email) e.email = "We need an email to confirm.";
    else if (!emailRe.test(email)) e.email = "That email doesn’t look right.";
    if (!data.get("date")) e.date = "Choose a date.";
    if (!data.get("time")) e.time = "Choose a time.";
    if (!data.get("party")) e.party = "How many guests?";
    return e;
  }

  function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setSubmitError(null);
    const form = ev.currentTarget;
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length) {
      const first = form.querySelector<HTMLElement>("[aria-invalid='true']");
      first?.focus();
      return;
    }
    // Capture values now — the event is recycled before the async work runs.
    const data = new FormData(form);
    startTransition(async () => {
      const result = await submitReservation(data);
      if (result.ok) setSent(true);
      else setSubmitError(result.error);
    });
  }

  if (sent) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-sm border border-[var(--line)] bg-[var(--charcoal)] px-8 py-14 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--brass)] text-[var(--brass)]">
          <Check className="h-6 w-6" />
        </span>
        <h3 className="mt-6 font-display text-4xl text-[var(--bone)]">
          Request received
        </h3>
        <p className="mt-3 max-w-sm text-[var(--bone-dim)]">
          Salamat. Our maître d’ will confirm your table by email within the hour.
          For same-day requests, please call{" "}
          <span className="whitespace-nowrap text-[var(--bone)]">
            +63 2 8555 0170
          </span>
          .
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="link-underline mt-8 text-[0.72rem] font-medium uppercase tracking-[0.24em] text-[var(--brass)]"
        >
          Make another request
        </button>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className="rounded-sm border border-[var(--line)] bg-[var(--charcoal)] p-6 sm:p-9"
    >
      <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
        <Field label="Name" name="name" error={errors.name}>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            aria-invalid={!!errors.name}
            className="fld"
            placeholder="Juan dela Cruz"
          />
        </Field>

        <Field label="Email" name="email" error={errors.email}>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            aria-invalid={!!errors.email}
            className="fld"
            placeholder="you@email.com"
          />
        </Field>

        <Field label="Phone" name="phone" optional error={undefined}>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            className="fld"
            placeholder="+63"
          />
        </Field>

        <Field label="Date" name="date" error={errors.date}>
          <input
            id="date"
            name="date"
            type="date"
            min={today}
            aria-invalid={!!errors.date}
            className="fld"
          />
        </Field>

        <Field label="Time" name="time" error={errors.time}>
          <select id="time" name="time" aria-invalid={!!errors.time} className="fld" defaultValue="">
            <option value="" disabled>
              Select a time
            </option>
            {TIMES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>

        <Field label="Guests" name="party" error={errors.party}>
          <select id="party" name="party" aria-invalid={!!errors.party} className="fld" defaultValue="">
            <option value="" disabled>
              Party size
            </option>
            {PARTY.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </Field>

        <Field label="Occasion" name="occasion" optional className="sm:col-span-2">
          <select id="occasion" name="occasion" className="fld" defaultValue="—">
            {OCCASIONS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </Field>

        <Field label="Anything we should know?" name="notes" optional className="sm:col-span-2">
          <textarea
            id="notes"
            name="notes"
            rows={3}
            className="fld resize-none"
            placeholder="Dietary needs, seating preference, allergies…"
          />
        </Field>
      </div>

      {submitError && (
        <p
          role="alert"
          className="mt-6 rounded-sm border border-[var(--clay)]/50 bg-[var(--clay)]/10 px-4 py-3 text-[0.85rem] text-[var(--bone)]"
        >
          {submitError}
        </p>
      )}

      <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[0.78rem] leading-relaxed text-[var(--bone-faint)]">
          Tables are held for 15 minutes past the reserved time.
        </p>
        <button
          type="submit"
          disabled={pending}
          aria-busy={pending}
          className="btn btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {pending ? "Sending…" : "Request reservation"}
        </button>
      </div>

      <style>{`
        .fld {
          width: 100%;
          background: var(--espresso);
          border: 1px solid var(--line-strong);
          color: var(--bone);
          font-family: var(--font-body), sans-serif;
          font-size: 0.95rem;
          padding: 0.72rem 0.85rem;
          min-height: 48px;
          border-radius: 2px;
          transition: border-color 0.25s var(--ease-hearth);
          color-scheme: dark;
        }
        .fld::placeholder { color: var(--bone-faint); }
        .fld:hover { border-color: var(--line); }
        .fld:focus { outline: none; border-color: var(--brass); }
        .fld[aria-invalid="true"] { border-color: var(--clay); }
        select.fld { appearance: none; cursor: pointer;
          background-image: linear-gradient(45deg, transparent 50%, var(--brass) 50%), linear-gradient(135deg, var(--brass) 50%, transparent 50%);
          background-position: right 1.1rem center, right 0.82rem center;
          background-size: 6px 6px, 6px 6px;
          background-repeat: no-repeat;
          padding-right: 2.4rem;
        }
      `}</style>
    </form>
  );
}

function Field({
  label,
  name,
  error,
  optional,
  className = "",
  children,
}: {
  label: string;
  name: string;
  error?: string;
  optional?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={name}
        className="mb-2 flex items-baseline gap-2 text-[0.68rem] font-medium uppercase tracking-[0.22em] text-[var(--bone-dim)]"
      >
        {label}
        {optional && (
          <span className="text-[0.6rem] tracking-[0.16em] text-[var(--bone-faint)]">
            optional
          </span>
        )}
      </label>
      {children}
      {error && (
        <p role="alert" className="mt-1.5 text-[0.76rem] text-[var(--clay-text)]">
          {error}
        </p>
      )}
    </div>
  );
}
