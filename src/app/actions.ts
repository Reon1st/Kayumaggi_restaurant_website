"use server";

import { bookedCoversByDate, createReservation, type Reservation } from "@/lib/airtable";
import * as email from "@/lib/email";
import { parseGuests, seatsPerSeating, TIMES } from "@/lib/reservations";

/**
 * Reservation submission — a real Server Action (server-only, reachable by POST).
 *
 * The flow, in order, and the order matters:
 *   1. validate            — authoritatively, server-side; never trust the client
 *   2. read the book       — how many covers are already promised that evening
 *   3. decide              — confirm if the seating fits, decline if it's full
 *   4. capture             — write the booking WITH its decision to Airtable
 *   5. email the guest     — the verdict, branded
 *
 * Capture is authoritative; email is not. If the mail fails the booking still
 * stands and the guest still sees their answer on screen — a table must never be
 * lost because an email provider had a bad minute.
 */

export type ReserveResult =
  | { ok: true; status: "confirmed" }
  | { ok: true; status: "declined"; alternatives: string[] }
  | { ok: false; error: string };

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitReservation(formData: FormData): Promise<ReserveResult> {
  const get = (k: string) => String(formData.get(k) ?? "").trim();

  // Honeypot. A real person never sees this field, so anything in it is a bot.
  // Answer success-shaped: the bot learns nothing, and nothing is written.
  if (get("company")) return { ok: true, status: "confirmed" };

  const r: Reservation = {
    name: get("name"),
    email: get("email"),
    phone: get("phone"),
    date: get("date"),
    time: get("time"),
    party: get("party"),
    occasion: get("occasion"),
    notes: get("notes"),
  };

  // ---- 1. Validation (authoritative) ----
  if (!r.name || !r.email || !emailRe.test(r.email) || !r.date || !r.time || !r.party) {
    return { ok: false, error: "Please complete the required fields and try again." };
  }
  if (r.date < new Date().toISOString().slice(0, 10)) {
    return { ok: false, error: "Please choose a date that hasn’t passed." };
  }
  if (!TIMES.includes(r.time as (typeof TIMES)[number])) {
    return { ok: false, error: "Please choose one of our seating times." };
  }

  // ---- 2 & 3. Read the book, then decide ----
  const capacity = seatsPerSeating();
  const requested = parseGuests(r.party);

  let booked: Record<string, number>;
  try {
    booked = await bookedCoversByDate(r.date);
  } catch (err) {
    console.error("[reservation] availability lookup failed:", err);
    return { ok: false, error: "We couldn’t reach our reservation book — please call us to reserve." };
  }

  const fits = (slot: string) => (booked[slot] ?? 0) + requested <= capacity;
  const confirmed = fits(r.time);

  // Only computed on a decline, and only from the book we already read — no
  // second round-trip just to be helpful.
  const alternatives = confirmed ? [] : TIMES.filter((t) => t !== r.time && fits(t));

  // ---- 4. Capture (authoritative) ----
  const saved = await createReservation(r, confirmed ? "Confirmed" : "Declined");
  if (!saved) {
    return { ok: false, error: "We couldn’t save your request just now — please call us to reserve." };
  }

  // ---- 5. Email (best-effort; a failure here must not lose the booking) ----
  const msg = confirmed ? email.confirmed(r) : email.declined(r, alternatives);
  await email.send(r.email, r.name, msg.subject, msg.html, msg.text);

  return confirmed
    ? { ok: true, status: "confirmed" }
    : { ok: true, status: "declined", alternatives };
}
