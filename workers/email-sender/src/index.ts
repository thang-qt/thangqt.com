import { EmailMessage } from 'cloudflare:email';

interface Env {
  EMAIL: {
    send: (message: EmailMessage) => Promise<void>;
  };
  EMAIL_WORKER_TOKEN: string;
}

function extractReplyTo(contactMethod?: string | null) {
  if (!contactMethod) return undefined;
  const trimmed = contactMethod.trim();
  return trimmed.includes('@') ? trimmed : undefined;
}

export default {
  async fetch(request: Request, env: Env) {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const authHeader = request.headers.get('Authorization');
    if (!env.EMAIL_WORKER_TOKEN || authHeader !== `Bearer ${env.EMAIL_WORKER_TOKEN}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    let payload: { subject?: string; body?: string; contactMethod?: string };
    try {
      payload = await request.json();
    } catch {
      return new Response('Invalid JSON', { status: 400 });
    }

    const subject = payload.subject?.trim();
    const body = payload.body?.trim();
    if (!subject || !body) {
      return new Response('Missing subject or body', { status: 400 });
    }

    const from = 'contact@thangqt.com';
    const to = 'thang@thangqt.com';
    const replyTo = extractReplyTo(payload.contactMethod);

    const headers = [
      `From: ${from}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/plain; charset=UTF-8',
    ];
    if (replyTo) {
      headers.push(`Reply-To: ${replyTo}`);
    }

    const raw = `${headers.join('\r\n')}\r\n\r\n${body}\r\n`;
    const message = new EmailMessage(from, to, raw);

    try {
      await env.EMAIL.send(message);
    } catch (error) {
      console.error('Email send failed:', error);
      return new Response('Failed to send email', { status: 500 });
    }

    return new Response('OK', { status: 200 });
  },
};
