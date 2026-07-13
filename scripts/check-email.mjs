/**
 * Verifies Brevo will actually deliver mail as your sender.
 *
 *   npm run check:email
 *
 * Sends one plain test message to the sender address itself. This is separate
 * from check:airtable on purpose — an API key that Brevo accepts can still be
 * refused at send time if the FROM address isn't verified, and the raw error
 * doesn't say so plainly. Catch it here, not from a guest's missing confirmation.
 */

const key = process.env.BREVO_API_KEY;
const from = process.env.RESERVATIONS_FROM_EMAIL;
const fromName = process.env.RESERVATIONS_FROM_NAME ?? "Kayumanggi Reservations";

const die = (msg) => {
  console.error(`\n  ✗ ${msg}\n`);
  process.exit(1);
};

if (!key || !from) {
  die(
    "BREVO_API_KEY and RESERVATIONS_FROM_EMAIL must be set in .env\n" +
      "    Key:    https://app.brevo.com → SMTP & API → API Keys\n" +
      "    Sender: Senders, Domains & IPs → Senders → add AND verify"
  );
}

console.log(`\n  → sending a test message as "${fromName}" <${from}> …`);

const res = await fetch("https://api.brevo.com/v3/smtp/email", {
  method: "POST",
  headers: { "api-key": key, "content-type": "application/json", accept: "application/json" },
  body: JSON.stringify({
    sender: { name: fromName, email: from },
    to: [{ email: from, name: "Kayumanggi test" }],
    subject: "Kayumanggi — mail is wired",
    htmlContent:
      '<div style="font-family:Georgia,serif;background:#14100c;color:#efe7d8;padding:32px;">' +
      '<div style="letter-spacing:6px;">KAYUMANGGI</div>' +
      '<p style="font-family:Helvetica,Arial,sans-serif;color:#c9bca6;">' +
      "If you're reading this, Brevo will deliver reservation emails to real guests.</p></div>",
    textContent: "Brevo is wired. Reservation emails will deliver.",
  }),
});

if (!res.ok) {
  const body = await res.text();
  if (res.status === 401) {
    die(`Brevo rejected the API key (401).\n    ${body}\n\n    Regenerate it under SMTP & API → API Keys.`);
  }
  if (res.status === 400 && /sender/i.test(body)) {
    die(
      `Brevo refused the sender address (400).\n    ${body}\n\n` +
        `    "${from}" is not a VERIFIED sender. Add it under\n` +
        `    Senders, Domains & IPs → Senders, then click the link Brevo emails you.\n` +
        `    An API key alone is not enough — the address must be confirmed.`
    );
  }
  die(`Brevo responded ${res.status}.\n    ${body}`);
}

console.log(`  ✓ accepted for delivery — check the inbox at ${from}`);
console.log("\n  Email is wired. Guests will get their confirm/decline.\n");
