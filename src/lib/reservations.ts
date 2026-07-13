/**
 * Shared reservation vocabulary. Imported by BOTH the form and the server so a
 * new time slot or party size can't be added to one and forgotten in the other —
 * the availability maths depends on these two agreeing.
 */

export const TIMES = [
  "6:00 PM",
  "6:30 PM",
  "7:00 PM",
  "7:30 PM",
  "8:00 PM",
  "8:30 PM",
  "9:00 PM",
] as const;

export const PARTY_SIZES = [
  "1 guest",
  "2 guests",
  "3 guests",
  "4 guests",
  "5 guests",
  "6 guests",
  "7+ (call us)",
] as const;

export const OCCASIONS = [
  "—",
  "Anniversary",
  "Birthday",
  "Business",
  "Celebration",
  "Just because",
] as const;

/**
 * Covers the room can seat in a single seating. The site says "forty seats", so
 * that's the default.
 *
 * ponytail: each time slot is treated as an independent 40 covers. A real room
 * overlaps seatings — a table booked at 6:00 is still occupied at 7:00 — so true
 * capacity is a rolling window, not a bucket. Modelling that is a booking engine,
 * not a demo. Override with RESERVATION_CAPACITY (set it to 4 to watch a decline
 * fire without submitting the form twenty times).
 */
export const seatsPerSeating = () =>
  Number(process.env.RESERVATION_CAPACITY) || 40;

/** "2 guests" → 2 · "7+ (call us)" → 7 · anything unparseable → 1 (never 0). */
export function parseGuests(party: string): number {
  const n = parseInt(party, 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}
