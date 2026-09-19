import nodemailer, { type Transporter } from "nodemailer";
import { generateIssueEmailHtml } from "../lib/email-template";
import { getDb } from "./mongodb";

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, SMTP_SECURE, ADMIN_EMAIL } = process.env;
let transporter: Transporter | null = null;
let initError: string | null = null;

function getTransport(): Transporter | null {
  if (transporter) return transporter;
  if (initError) return null;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
    initError = "SMTP not fully configured";
    return null;
  }
  try {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: SMTP_SECURE === "true" || Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS }
    });
    return transporter;
  } catch (e) { initError = (e as Error).message; return null; }
}

async function log(entry: Record<string, unknown>) {
  try { const db = await getDb(); await db.collection("emailLogs").insertOne({ ...entry, at: new Date() }); } catch {}
}

export interface SendResult { ok: boolean; error?: string }

export async function sendMail(a: { to: string | string[]; subject: string; html: string; text?: string; type: string; attachments?: any[] }): Promise<SendResult> {
  const t = getTransport();
  if (!t) { await log({ ...a, status: "SKIPPED", reason: initError }); return { ok: false, error: initError ?? "SMTP unavailable" }; }
  try {
    const info = await t.sendMail({
      from: SMTP_FROM!,
      to: Array.isArray(a.to) ? a.to.join(",") : a.to,
      subject: a.subject, html: a.html,
      text: a.text ?? a.html.replace(/<[^>]+>/g, " "),
      attachments: a.attachments
    });
    await log({ ...a, status: "SENT", messageId: info.messageId });
    return { ok: true };
  } catch (e) {
    const msg = (e as Error).message;
    await log({ ...a, status: "FAILED", reason: msg });
    return { ok: false, error: msg };
  }
}

const wrap = (b: string) => `<div style="font-family:Inter,Segoe UI,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f172a">${b}</div>`;

type AlertIssue = { issueCode: string; title: string; location: string; severity: string; category: string; department?: string; impact?: number; affectedUsers?: number; reportedAt: string; description?: string; building?: string; room?: string; imageUrl?: string; rollNumber?: string; };

export const templates = {
  otp: (code: string) => wrap(`<h2 style="margin:0 0 8px">Your FixMyCampus code</h2><p style="margin:0 0 16px;color:#334155">Enter this 6-digit code. It expires in 10 minutes.</p><div style="font-size:32px;font-weight:700;letter-spacing:8px;background:#f1f5f9;padding:16px 20px;border-radius:12px;text-align:center">${code}</div>`),
  newIssue: (i: any) => generateIssueEmailHtml(i),
  criticalIssue: (i: any) => generateIssueEmailHtml(i),
  statusChange: (i: { issueCode: string; title: string; status: string; }) => wrap(`<h2 style="margin:0 0 8px">Update on ${i.issueCode}</h2><p style="margin:0;color:#334155">${i.title}</p><p style="margin:8px 0 0;color:#334155">New status: <b>${i.status}</b></p>`)
};

export const adminAddress = () => ADMIN_EMAIL ?? "mohankrishna111311@gmail.com";

export async function sendOtpEmail(to: string, code: string) {
  return sendMail({ to, subject: `[FixMyCampus] Your sign-in code: ${code}`, html: templates.otp(code), type: "otp" });
}

export async function sendAdminIssueAlert(i: AlertIssue) {
  const critical = i.severity === "CRITICAL";
  const attachments = [];
  
  if (i.imageUrl && i.imageUrl.startsWith("data:image")) {
    const base64Data = i.imageUrl.split(",")[1];
    attachments.push({
      filename: "evidence.jpg",
      content: base64Data,
      encoding: "base64",
      cid: "evidence_img" 
    });
  }

  const templateData = { ...i, hasImage: attachments.length > 0 };

  return sendMail({
    to: adminAddress(),
    subject: critical ? `[FixMyCampus] Critical Issue — ${i.location}` : `[FixMyCampus] New Issue — ${i.issueCode}`,
    html: critical ? templates.criticalIssue(templateData) : templates.newIssue(templateData),
    attachments: attachments,
    type: critical ? "critical-issue" : "new-issue"
  });
}

export async function sendIssueStatusEmail(to: string, i: { issueCode: string; title: string; status: string; }) {
  return sendMail({ to, subject: `[FixMyCampus] ${i.issueCode} — ${i.status}`, html: templates.statusChange(i), type: "status-change" });
}

export async function sendTestEmail(to?: string) {
  return sendMail({ to: to ?? adminAddress(), subject: "[FixMyCampus] SMTP test email", html: `<div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f172a"><h2>SMTP is working ✅</h2></div>`, type: "test" });
}
