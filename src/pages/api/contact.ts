import type { APIRoute } from "astro";
import { Resend } from "resend";
import { z } from "astro:schema";

// This endpoint must run at request time, not at build time.
export const prerender = false;

const inputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  message: z.string().trim().min(2).max(5000),
  website: z.string().optional(), // honeypot
  "cf-turnstile-response": z.string().optional(),
  lang: z.enum(["zh", "en"]).default("zh"),
});

const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;
const CONTACT_TO = (import.meta.env.CONTACT_TO ?? "")
  .split(",")
  .map((s: string) => s.trim())
  .filter(Boolean);
const CONTACT_FROM = import.meta.env.CONTACT_FROM ?? "no-reply@sowfoundation.org";
const TURNSTILE_SECRET_KEY = import.meta.env.TURNSTILE_SECRET_KEY;

async function verifyTurnstile(token: string, ip?: string): Promise<boolean> {
  if (!TURNSTILE_SECRET_KEY) {
    console.warn("[contact] TURNSTILE_SECRET_KEY not set, skipping verification");
    return true;
  }
  if (!token) return false;
  const body = new URLSearchParams();
  body.append("secret", TURNSTILE_SECRET_KEY);
  body.append("response", token);
  if (ip) body.append("remoteip", ip);
  try {
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
    });
    const data = (await r.json()) as { success?: boolean };
    return Boolean(data.success);
  } catch (err) {
    console.error("[contact] turnstile verify failed", err);
    return false;
  }
}

const escapeHtml = (s: string) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let payload: z.infer<typeof inputSchema>;
  try {
    const form = await request.formData();
    payload = inputSchema.parse(Object.fromEntries(form));
  } catch (err) {
    return json({ ok: false, error: "invalid_input" }, 400);
  }

  // Honeypot — quietly succeed
  if (payload.website && payload.website.trim().length > 0) {
    return json({ ok: true });
  }

  const ip = request.headers.get("cf-connecting-ip") ?? clientAddress ?? undefined;

  // Bot check
  const ok = await verifyTurnstile(payload["cf-turnstile-response"] ?? "", ip);
  if (!ok) {
    return json({ ok: false, error: "bot_check_failed" }, 403);
  }

  if (!RESEND_API_KEY) {
    console.error("[contact] RESEND_API_KEY not configured");
    return json({ ok: false, error: "email_not_configured" }, 500);
  }
  if (CONTACT_TO.length === 0) {
    return json({ ok: false, error: "no_recipients" }, 500);
  }

  const resend = new Resend(RESEND_API_KEY);

  const subject = `[sowfoundation.org] Message from ${payload.name}`;
  const text = [
    `From: ${payload.name} <${payload.email}>`,
    `Locale: ${payload.lang}`,
    `IP: ${ip ?? "unknown"}`,
    "",
    payload.message,
  ].join("\n");

  const html = `<!doctype html>
<html><body style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;color:#1d1d1f;max-width:640px;margin:auto;padding:24px;">
  <h2 style="font-size:18px;margin:0 0 12px;">New contact submission</h2>
  <p style="margin:0 0 4px;"><strong>From:</strong> ${escapeHtml(payload.name)} &lt;<a href="mailto:${escapeHtml(payload.email)}">${escapeHtml(payload.email)}</a>&gt;</p>
  <p style="margin:0 0 4px;color:#6e6e73;font-size:13px;">Locale: ${payload.lang} · IP: ${escapeHtml(ip ?? "unknown")}</p>
  <hr style="border:0;border-top:1px solid #d2d2d7;margin:16px 0;" />
  <pre style="white-space:pre-wrap;font-family:inherit;font-size:15px;line-height:1.6;margin:0;">${escapeHtml(payload.message)}</pre>
</body></html>`;

  const { error } = await resend.emails.send({
    from: `SOW Website <${CONTACT_FROM}>`,
    to: CONTACT_TO,
    replyTo: payload.email,
    subject,
    text,
    html,
  });

  if (error) {
    console.error("[contact] resend error", error);
    return json({ ok: false, error: "send_failed" }, 500);
  }

  return json({ ok: true });
};
