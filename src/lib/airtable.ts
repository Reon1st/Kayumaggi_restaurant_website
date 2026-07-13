import "server-only";

import { parseGuests, TIMES } from "./reservations";

/**
 * Airtable is the reservation book: the record of what has been promised, and
 * therefore the thing availability is decided against. Plain REST via fetch —
 * no SDK.
 *
 * Env (see .env.example): AIRTABLE_TOKEN, AIRTABLE_BASE_ID, AIRTABLE_TABLE.
 * With those unset every call reports "not configured" and the caller degrades
 * gracefully rather than throwing at a guest.
 */

export type Reservation = {
  name: string;
  email: string;
  phone: string;
  date: string; // yyyy-mm-dd
  time: string;
  party: string;
  occasion: string;
  notes: string;
};

export type ReservationStatus = "Confirmed" | "Declined";

const cfg = () => {
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const table = process.env.AIRTABLE_TABLE ?? "Reservations";
  if (!token || !baseId) return null;
  return {
    url: `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  };
};

export const isConfigured = () => cfg() !== null;

/**
 * Covers already promised on a given date, per time slot.
 *
 * Only CONFIRMED bookings consume seats — a declined one never held a table, so
 * counting it would shrink the room for everyone after it.
 */
export async function bookedCoversByDate(
  date: string
): Promise<Record<string, number>> {
  const c = cfg();
  const booked: Record<string, number> = Object.fromEntries(TIMES.map((t) => [t, 0]));
  if (!c) return booked;

  // DATESTR() normalises Airtable's Date cell to yyyy-mm-dd before comparing;
  // a raw {Date}='2026-07-18' string compare does not reliably match.
  const formula = `AND(DATESTR({Date})='${date}',{Status}='Confirmed')`;
  const url =
    `${c.url}?filterByFormula=${encodeURIComponent(formula)}` +
    `&fields%5B%5D=Time&fields%5B%5D=Guests&pageSize=100`;

  const res = await fetch(url, { headers: c.headers, cache: "no-store" });
  if (!res.ok) {
    // Availability is best-effort. If the read fails we do NOT want to wrongly
    // tell a guest the room is full, so an empty book means "seats available"
    // and the booking goes through. Over-booking by one is recoverable; turning
    // away a real guest because of our own outage is not.
    console.error("[airtable] availability read failed", res.status, await res.text());
    return booked;
  }

  const body = (await res.json()) as {
    records: { fields: { Time?: string; Guests?: string } }[];
  };

  for (const r of body.records) {
    const slot = r.fields.Time;
    if (slot && slot in booked) booked[slot] += parseGuests(r.fields.Guests ?? "");
  }
  return booked;
}

/** Writes the booking with the decision already made. Returns false if it didn't land. */
export async function createReservation(
  r: Reservation,
  status: ReservationStatus
): Promise<boolean> {
  const c = cfg();
  if (!c) {
    console.info("[airtable] not configured — logging only:", { ...r, status });
    return true;
  }

  const res = await fetch(c.url, {
    method: "POST",
    headers: c.headers,
    body: JSON.stringify({
      // typecast lets Airtable coerce into its Date/Single-select columns, and
      // will create the "Confirmed"/"Declined" select options if they're missing.
      typecast: true,
      records: [
        {
          fields: {
            Name: r.name,
            Email: r.email,
            Phone: r.phone,
            Date: r.date,
            Time: r.time,
            Guests: r.party,
            Occasion: r.occasion,
            Notes: r.notes,
            Status: status,
            Submitted: new Date().toISOString(),
          },
        },
      ],
    }),
  });

  if (!res.ok) {
    console.error("[airtable] write failed", res.status, await res.text());
    return false;
  }
  return true;
}
