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

// Throw rather than process.exit(): exiting mid-flight while fetch still has an
// open handle trips a libuv assertion on Windows. Caught at the bottom.
class Fail extends Error {}
const die = (msg) => {
  throw new Fail(msg);
};

try {
  await main();
} catch (err) {
  console.error(`\n  ✗ ${err instanceof Fail ? err.message : err}\n`);
  process.exitCode = 1;
}

async function main() {
  if (!key || !from) {
    die(
      "BREVO_API_KEY and RESERVATIONS_FROM_EMAIL must be set in .env\n" +
        "    Key:    https://app.brevo.com → SMTP & API → API Keys\n" +
        "    Sender: Senders, Domains & IPs → Senders → add AND verify"
    );
  }

  // Brevo hands out two different keys from the same menu, on adjacent tabs.
  // Only the REST one works here, and the API's own error ("Key not found") does
  // not tell you that you grabbed the wrong kind — so say it plainly.
  if (key.startsWith("xsmtpsib-")) {
    die(
      "That's an SMTP key, not an API key.\n\n" +
        "    You're on the SMTP tab. This code calls Brevo's REST API, which needs\n" +
        "    a key from the API KEYS tab — it starts with `xkeysib-`, not `xsmtpsib-`.\n\n" +
        "    app.brevo.com → SMTP & API → API Keys → Generate a new API key"
    );
  }
  if (!key.startsWith("xkeysib-")) {
    console.warn(`  ! key doesn't start with "xkeysib-" — expect a 401 if it isn't an API key`);
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
      die(
        `Brevo rejected the key (401).\n    ${body}\n\n` +
          `    Make sure it came from the API KEYS tab (starts with "xkeysib-"),\n` +
          `    not the SMTP tab ("xsmtpsib-"). They live side by side.`
      );
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
  console.log(`  ! from a gmail.com sender it may land in Spam or Promotions — that's`);
  console.log(`    DMARC, not a misconfiguration. Look there before assuming it failed.`);
  console.log("\n  Email is wired. Guests will get their confirm/decline.\n");
}
