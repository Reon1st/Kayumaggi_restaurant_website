"use server";

/**
 * Reservation submission — a real Server Action (runs only on the server,
 * reachable via POST). It re-validates every field server-side (the client
 * validation is only for UX; never trust the client) and delivers the request
 * by email through Resend's REST API using plain fetch — no SDK dependency.
 *
 * Configure via env (see .env.example):
 *   RESEND_API_KEY      — https://resend.com api key
 *   RESERVATIONS_EMAIL  — inbox that should receive requests
 *   RESERVATIONS_FROM   — a verified sender on your domain, e.g. "Kayumanggi <reserve@kayumanggi.ph>"
 *
 * With those unset the action still succeeds and logs the request server-side,
 * so the form is fully functional in development. Swap the fetch block for
 * Composio / a webhook / a database if you'd rather route it elsewhere.
 */

export type ReserveResult = { ok: true } | { ok: false; error: string };

type Reservation = {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  party: string;
  occasion: string;
  notes: string;
  receivedAt: string;
};

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitReservation(
  formData: FormData
): Promise<ReserveResult> {
  const get = (k: string) => String(formData.get(k) ?? "").trim();

  const reservation: Reservation = {
    name: get("name"),
    email: get("email"),
    phone: get("phone"),
    date: get("date"),
    time: get("time"),
    party: get("party"),
    occasion: get("occasion"),
    notes: get("notes"),
    receivedAt: new Date().toISOString(),
  };

  // ---- Server-side validation (authoritative) ----
  const { name, email, date, time, party } = reservation;
  if (!name || !email || !emailRe.test(email) || !date || !time || !party) {
    return { ok: false, error: "Please complete the required fields and try again." };
  }
  // Reject dates in the past (client sends yyyy-mm-dd)
  if (date < new Date().toISOString().slice(0, 10)) {
    return { ok: false, error: "Please choose a date that hasn’t passed." };
  }

  const key = process.env.RESEND_API_KEY;
  const to = process.env.RESERVATIONS_EMAIL;
  const from = process.env.RESERVATIONS_FROM;

  // Email not configured yet → succeed and log, so the form still works.
  if (!key || !to || !from) {
    console.info("[reservation] email not configured — logging request only:", reservation);
    return { ok: true };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        reply_to: email,
        subject: `Reservation · ${name} · ${party} · ${date} ${time}`,
        text: renderEmail(reservation),
      }),
    });

    if (!res.ok) {
      console.error("[reservation] Resend responded", res.status, await res.text());
      return { ok: false, error: "We couldn’t send your request just now — please call us to reserve." };
    }
    return { ok: true };
  } catch (err) {
    console.error("[reservation] send failed:", err);
    return { ok: false, error: "Something went wrong on our end — please call us to reserve." };
  }
}

function renderEmail(r: Reservation): string {
  return [
    "New reservation request — Kayumanggi",
    "",
    `Name:     ${r.name}`,
    `Email:    ${r.email}`,
    `Phone:    ${r.phone || "—"}`,
    `Date:     ${r.date}`,
    `Time:     ${r.time}`,
    `Guests:   ${r.party}`,
    `Occasion: ${r.occasion || "—"}`,
    "",
    "Notes:",
    r.notes || "—",
    "",
    `Received: ${r.receivedAt}`,
  ].join("\n");
}
