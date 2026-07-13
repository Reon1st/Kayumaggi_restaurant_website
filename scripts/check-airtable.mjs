/**
 * Verifies the Airtable reservation table is wired correctly.
 *
 *   npm run check:airtable
 *
 * Writes one throwaway record with every field the Server Action sends, then
 * deletes it again. This exists because Airtable rejects a field-name mismatch
 * with a 422 and a terse message — far easier to hit that here, once, than to
 * discover it from a real guest's failed booking.
 *
 * Reads credentials from .env via node --env-file. Nothing is hardcoded.
 */

const token = process.env.AIRTABLE_TOKEN;
const baseId = process.env.AIRTABLE_BASE_ID;
const table = process.env.AIRTABLE_TABLE ?? "Reservations";

// process.exit() while fetch still holds an open handle trips a libuv assertion
// on Windows. Set the code and let the process wind down on its own.
const die = (msg) => {
  console.error(`\n  ✗ ${msg}\n`);
  process.exitCode = 1;
  throw new Error("check failed");
};

if (!token || !baseId) {
  die(
    "AIRTABLE_TOKEN and AIRTABLE_BASE_ID must be set in .env\n" +
      "    Token:   https://airtable.com/create/tokens\n" +
      "    Base id: the app... segment of your base's URL"
  );
}

const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`;
const auth = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

// Exactly what src/app/actions.ts sends — keep these two in step.
const fields = {
  Name: "TEST — safe to delete",
  Email: "test@example.com",
  Phone: "+63 900 000 0000",
  Date: new Date().toISOString().slice(0, 10),
  Time: "7:30 PM",
  Guests: "2 guests",
  Occasion: "Birthday",
  Notes: "Written by scripts/check-airtable.mjs. Deleted automatically.",
  Status: "New",
  Submitted: new Date().toISOString(),
};

console.log(`\n  → writing a test row to "${table}" in ${baseId} …`);

const res = await fetch(url, {
  method: "POST",
  headers: auth,
  body: JSON.stringify({ typecast: true, records: [{ fields }] }),
});

const body = await res.json().catch(() => ({}));

if (!res.ok) {
  const detail = body?.error?.message ?? JSON.stringify(body);
  if (res.status === 422) {
    die(
      `Airtable rejected the fields (422).\n    ${detail}\n\n` +
        `    This is almost always a column-name mismatch. The table must have\n` +
        `    these columns, spelled and capitalised exactly:\n\n` +
        `      ${Object.keys(fields).join(", ")}`
    );
  }
  if (res.status === 401 || res.status === 403) {
    die(
      `Airtable refused the token (${res.status}).\n    ${detail}\n\n` +
        `    Check the token has the data.records:write scope AND that this base\n` +
        `    is listed under its Access. Scope alone isn't enough.`
    );
  }
  if (res.status === 404) {
    die(
      `Base or table not found (404).\n    ${detail}\n\n` +
        `    AIRTABLE_BASE_ID should start with "app". AIRTABLE_TABLE is the\n` +
        `    table's NAME (e.g. Reservations), not its tbl... id.`
    );
  }
  die(`Airtable responded ${res.status}.\n    ${detail}`);
}

const id = body.records?.[0]?.id;
console.log(`  ✓ row created (${id}) — every column name matched`);

const del = await fetch(`${url}/${id}`, { method: "DELETE", headers: auth });
console.log(
  del.ok
    ? "  ✓ test row deleted — your table is clean\n"
    : `  ! could not delete the test row (${del.status}) — remove "${fields.Name}" by hand\n`
);

console.log("  Airtable is wired correctly. The reservation form will capture live.\n");
