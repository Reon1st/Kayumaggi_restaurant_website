"use client";

import { useState, useTransition } from "react";
import { Check } from "./icons";
import { submitReservation } from "@/app/actions";
import { TIMES, PARTY_SIZES, OCCASIONS } from "@/lib/reservations";

type Errors = Partial<Record<"name" | "email" | "date" | "time" | "party", string>>;
/** The verdict, once the server has checked the book against the room. */
type Outcome =
  | { status: "confirmed" }
  | { status: "declined"; alternatives: string[]; time: string };

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const today = new Date().toISOString().split("T")[0];

export default function ReserveForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [outcome, setOutcome] = useState<Outcome | null>(null);
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
    const time = String(data.get("time") ?? "");
    startTransition(async () => {
      const result = await submitReservation(data);
      if (!result.ok) return setSubmitError(result.error);
      setOutcome(
        result.status === "confirmed"
          ? { status: "confirmed" }
          : { status: "declined", alternatives: result.alternatives, time }
      );
    });
  }

  if (outcome?.status === "confirmed") {
    return (
      <Panel>
        <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--brass)] text-[var(--brass)]">
          <Check className="h-6 w-6" />
        </span>
        <h3 className="mt-6 font-display text-4xl text-[var(--bone)]">
          Your table is confirmed
        </h3>
        <p className="mt-3 max-w-sm text-[var(--bone-dim)]">
          Salamat. A confirmation is on its way to your inbox. Your table is held
          for 15 minutes past the reserved time.
        </p>
        <Again onClick={() => setOutcome(null)}>Book another table</Again>
      </Panel>
    );
  }

  if (outcome?.status === "declined") {
    return (
      <Panel>
        <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--clay)] font-display text-2xl text-[var(--clay-text)]">
          &mdash;
        </span>
        <h3 className="mt-6 font-display text-4xl text-[var(--bone)]">
          That seating is full
        </h3>
        <p className="mt-3 max-w-sm text-[var(--bone-dim)]">
          We keep only forty seats, and{" "}
          <span className="text-[var(--bone)]">{outcome.time}</span> is spoken for.
          {outcome.alternatives.length > 0
            ? " These are still open that evening:"
            : " We’ve emailed you — reply and we’ll hold the next table that opens."}
        </p>

        {outcome.alternatives.length > 0 && (
          <p className="tnum mt-6 flex flex-wrap justify-center gap-x-4 gap-y-2 font-display text-xl text-[var(--brass)]">
            {outcome.alternatives.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </p>
        )}

        <a href="tel:+63285550170" className="btn btn-primary mt-8">
          Call to book
        </a>
        <Again onClick={() => setOutcome(null)}>Try another time</Again>
      </Panel>
    );
  }

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className="rounded-sm border border-[var(--line)] bg-[var(--charcoal)] p-6 sm:p-9"
    >
      {/* Honeypot. Positioned off-screen rather than display:none — plenty of
          bots skip hidden inputs but happily fill an off-screen one. tabIndex=-1
          and aria-hidden keep it out of the keyboard and screen-reader paths, so
          no real person can reach it. The server drops anything that fills it. */}
      <div aria-hidden className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

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
            {PARTY_SIZES.map((p) => (
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

/** The post-submit card. Both verdicts share it — only what's inside differs. */
function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-sm border border-[var(--line)] bg-[var(--charcoal)] px-8 py-14 text-center">
      {children}
    </div>
  );
}

function Again({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="link-underline mt-8 text-[0.72rem] font-medium uppercase tracking-[0.24em] text-[var(--brass)]"
    >
      {children}
    </button>
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
