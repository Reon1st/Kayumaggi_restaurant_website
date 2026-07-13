import "server-only";

import type { Reservation } from "./airtable";

/**
 * Guest email, via Brevo's REST API — plain fetch, no SDK.
 *
 * Brevo (not Resend) because Kayumanggi owns no domain: Brevo lets you verify a
 * single SENDER ADDRESS and then mail anyone, where Resend/Mailgun/SES require a
 * verified DOMAIN and otherwise only deliver to yourself. The provider is
 * confined to `send()` below — swapping to SendGrid means rewriting that one
 * function and nothing else.
 *
 * Env (see .env.example):
 *   BREVO_API_KEY           — https://app.brevo.com → SMTP & API → API keys
 *   RESERVATIONS_FROM_EMAIL — an address you have VERIFIED in Brevo
 *   RESERVATIONS_FROM_NAME  — display name; defaults to "Kayumanggi Reservations"
 *
 * NOTE ON HTML EMAIL: this is not web HTML. No flexbox, no grid, no web fonts,
 * and <style> blocks get stripped by several clients — hence tables and inlined
 * styles throughout. Cormorant will not load; it falls back to Georgia, which is
 * close enough to the brand to be a happy accident.
 */

const BONE = "#efe7d8";
const BONE_DIM = "#c9bca6";
const BONE_FAINT = "#978b7c";
const BRASS = "#c79a54";
const ESPRESSO = "#14100c";
const CHARCOAL = "#211a13";
const DISPLAY = "Georgia,'Times New Roman',serif";
const BODY = "Helvetica,Arial,sans-serif";

/** Returns false if the mail didn't go out. Never throws — email is never fatal. */
export async function send(to: string, name: string, subject: string, html: string, text: string) {
  const key = process.env.BREVO_API_KEY;
  const from = process.env.RESERVATIONS_FROM_EMAIL;
  const fromName = process.env.RESERVATIONS_FROM_NAME ?? "Kayumanggi Reservations";

  if (!key || !from) {
    console.info(`[email] not configured — would have sent "${subject}" to ${to}`);
    return false;
  }

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": key, "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        sender: { name: fromName, email: from },
        to: [{ email: to, name }],
        subject,
        htmlContent: html,
        textContent: text, // a plain-text part measurably helps deliverability
      }),
    });
    if (!res.ok) {
      console.error("[email] Brevo responded", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] send failed:", err);
    return false;
  }
}

/* ------------------------------ templates ------------------------------ */

const esc = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** dd Month yyyy — a guest should never read back "2026-07-18". */
const pretty = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-PH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

function shell(preheader: string, inner: string) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>Kayumanggi</title>
</head>
<body style="margin:0;padding:0;background:${ESPRESSO};">
<!-- preheader: the grey line shown next to the subject in the inbox list -->
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${ESPRESSO};">
<tr><td align="center" style="padding:40px 16px;">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:${CHARCOAL};border:1px solid rgba(239,231,216,0.12);">

    <tr><td align="center" style="padding:44px 32px 8px;">
      <div style="font-family:${DISPLAY};font-size:27px;letter-spacing:7px;color:${BONE};">KAYUMANGGI</div>
      <div style="font-family:${DISPLAY};font-size:13px;color:${BRASS};padding-top:14px;">&#9670;</div>
      <div style="font-family:${BODY};font-size:9px;letter-spacing:4px;color:${BONE_FAINT};padding-top:10px;">BONIFACIO GLOBAL CITY</div>
    </td></tr>

    ${inner}

    <tr><td style="padding:0 32px;"><div style="height:1px;background:rgba(239,231,216,0.12);"></div></td></tr>
    <tr><td align="center" style="padding:26px 32px 40px;font-family:${BODY};font-size:11px;line-height:20px;color:${BONE_FAINT};">
      7th Avenue cor. 30th Street &middot; Bonifacio Global City, Taguig<br>
      Tuesday&ndash;Sunday &middot; 6:00&ndash;11:00 PM &middot; <a href="tel:+63285550170" style="color:${BRASS};text-decoration:none;">+63 2 8555 0170</a>
    </td></tr>

  </table>
</td></tr>
</table>
</body>
</html>`;
}

function detailRows(r: Reservation) {
  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:11px 0;font-family:${BODY};font-size:10px;letter-spacing:2px;text-transform:uppercase;color:${BONE_FAINT};border-bottom:1px solid rgba(239,231,216,0.08);">${esc(label)}</td>
      <td align="right" style="padding:11px 0;font-family:${DISPLAY};font-size:16px;color:${BONE};border-bottom:1px solid rgba(239,231,216,0.08);">${esc(value)}</td>
    </tr>`;
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    ${row("Date", pretty(r.date))}
    ${row("Time", r.time)}
    ${row("Guests", r.party)}
    ${r.occasion && r.occasion !== "—" ? row("Occasion", r.occasion) : ""}
  </table>`;
}

export function confirmed(r: Reservation) {
  const heading = "Your table is confirmed";
  const html = shell(
    `${pretty(r.date)} at ${r.time}, for ${r.party}.`,
    `
    <tr><td align="center" style="padding:34px 32px 0;">
      <div style="font-family:${DISPLAY};font-size:34px;line-height:42px;color:${BONE};">${heading}</div>
      <div style="font-family:${BODY};font-size:14px;line-height:24px;color:${BONE_DIM};padding-top:16px;">
        Salamat, ${esc(r.name.split(" ")[0])}. We&rsquo;ve kept you a seat on the voyage &mdash;
        Manila, Tokyo, Paris, Roma, in one evening.
      </div>
    </td></tr>
    <tr><td style="padding:30px 32px 8px;">${detailRows(r)}</td></tr>
    <tr><td align="center" style="padding:22px 32px 34px;font-family:${BODY};font-size:12px;line-height:21px;color:${BONE_FAINT};">
      Your table is held for 15 minutes past the reserved time.<br>
      Need to change it? Simply reply to this email.
    </td></tr>`
  );
  const text = `Your table is confirmed.

Salamat, ${r.name.split(" ")[0]}.

Date:     ${pretty(r.date)}
Time:     ${r.time}
Guests:   ${r.party}${r.occasion && r.occasion !== "—" ? `\nOccasion: ${r.occasion}` : ""}

Your table is held for 15 minutes past the reserved time.
Reply to this email to change it.

Kayumanggi · 7th Avenue cor. 30th Street, BGC, Taguig · +63 2 8555 0170`;

  return { subject: `Your table on ${pretty(r.date)} is confirmed`, html, text };
}

export function declined(r: Reservation, alternatives: string[]) {
  const alts = alternatives.length
    ? `
    <tr><td align="center" style="padding:4px 32px 0;font-family:${BODY};font-size:10px;letter-spacing:2px;text-transform:uppercase;color:${BONE_FAINT};">
      Still open that evening
    </td></tr>
    <tr><td align="center" style="padding:14px 32px 0;font-family:${DISPLAY};font-size:20px;letter-spacing:1px;color:${BRASS};">
      ${alternatives.map(esc).join(' &nbsp;&middot;&nbsp; ')}
    </td></tr>`
    : `
    <tr><td align="center" style="padding:8px 32px 0;font-family:${BODY};font-size:13px;line-height:23px;color:${BONE_DIM};">
      That evening is fully committed. We&rsquo;d love to find you another.
    </td></tr>`;

  const html = shell(
    `${r.time} is fully booked${alternatives.length ? ` — ${alternatives[0]} is still open.` : "."}`,
    `
    <tr><td align="center" style="padding:34px 32px 0;">
      <div style="font-family:${DISPLAY};font-size:34px;line-height:42px;color:${BONE};">That seating is full</div>
      <div style="font-family:${BODY};font-size:14px;line-height:24px;color:${BONE_DIM};padding-top:16px;">
        Salamat, ${esc(r.name.split(" ")[0])}. We keep only forty seats, and ${esc(r.time)} on
        ${esc(pretty(r.date))} is spoken for.
      </div>
    </td></tr>
    ${alts}
    <tr><td align="center" style="padding:30px 32px 34px;">
      <a href="tel:+63285550170" style="display:inline-block;padding:15px 34px;background:${BRASS};color:${ESPRESSO};font-family:${BODY};font-size:11px;font-weight:bold;letter-spacing:3px;text-transform:uppercase;text-decoration:none;">Call to book</a>
      <div style="font-family:${BODY};font-size:12px;line-height:21px;color:${BONE_FAINT};padding-top:20px;">
        Or reply to this email and we&rsquo;ll hold the next table that opens.
      </div>
    </td></tr>`
  );

  const text = `That seating is full.

Salamat, ${r.name.split(" ")[0]}. We keep only forty seats, and ${r.time} on ${pretty(r.date)} is spoken for.
${alternatives.length ? `\nStill open that evening: ${alternatives.join(", ")}\n` : ""}
Call +63 2 8555 0170, or reply to this email and we'll hold the next table that opens.

Kayumanggi · 7th Avenue cor. 30th Street, BGC, Taguig`;

  return { subject: `${r.time} is fully booked — other tables open`, html, text };
}
