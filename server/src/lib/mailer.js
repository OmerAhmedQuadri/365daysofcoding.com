import nodemailer from 'nodemailer';

let transporter = null;

// Gmail credentials from server/.env. Google shows App Passwords in groups of four with spaces.
function getTransporter() {
  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, '');
  if (!user || !pass) return null;
  transporter ??= nodemailer.createTransport({ service: 'gmail', auth: { user, pass } });
  return transporter;
}

function escapeHtml(value) {
  const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(value).replace(/[&<>"']/g, (c) => entities[c]);
}

async function sendMail(message) {
  const transport = getTransporter();
  if (!transport) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('GMAIL_USER and GMAIL_APP_PASSWORD must be set to send email');
    }
    // Development without Gmail credentials: print the email so the flow can still be tested
    console.warn(`[mailer] Gmail not configured, not sending.\nTo: ${message.to}\nSubject: ${message.subject}\n${message.text}`);
    return;
  }
  await transport.sendMail({ from: `"365daysofcoding.com" <${process.env.GMAIL_USER.trim()}>`, ...message });
}

function sendCodeEmail({ to, name, code, expiresInMinutes, subject, intro, ignoreNote }) {
  return sendMail({
    to,
    subject,
    text: `Hi ${name},\n\n${intro}\n\n${code}\n\nIt expires in ${expiresInMinutes} minutes. ${ignoreNote}`,
    html: `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:420px;margin:0 auto;padding:24px;color:#111">
  <p>Hi ${escapeHtml(name)},</p>
  <p>${intro}</p>
  <p style="font-size:32px;font-weight:700;letter-spacing:6px;margin:16px 0">${code}</p>
  <p style="color:#555">It expires in ${expiresInMinutes} minutes. ${ignoreNote}</p>
</div>`,
  });
}

export function sendVerificationCode({ to, name, code, expiresInMinutes }) {
  return sendCodeEmail({
    to,
    name,
    code,
    expiresInMinutes,
    subject: `${code} is your 365daysofcoding.com verification code`,
    intro: 'Your 365daysofcoding.com verification code is:',
    ignoreNote: "If you didn't sign up, you can ignore this email.",
  });
}

export function sendPasswordResetCode({ to, name, code, expiresInMinutes }) {
  return sendCodeEmail({
    to,
    name,
    code,
    expiresInMinutes,
    subject: `${code} is your 365daysofcoding.com password reset code`,
    intro: 'Use this code to reset your 365daysofcoding.com password:',
    ignoreNote: "If you didn't ask to reset your password, you can ignore this email. Your password won't change.",
  });
}
