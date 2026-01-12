import type { APIRoute } from 'astro';

export const prerender = false;

interface ContactRequest {
  name?: string;
  contactMethod?: string;
  message: string;
  turnstileToken: string;
}

interface TurnstileResponse {
  success: boolean;
  'error-codes'?: string[];
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body: ContactRequest = await request.json();
    const { name, contactMethod, message, turnstileToken } = body;

    // Validate required fields
    if (!message?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!turnstileToken) {
      return new Response(
        JSON.stringify({ error: 'Turnstile verification is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify Turnstile token
    // Get secret from environment variable (set in CF Pages dashboard)
    const runtime = locals.runtime;
    const turnstileSecret = runtime?.env?.TURNSTILE_SECRET_KEY || '1x0000000000000000000000000000000AA'; // Test secret key

    const turnstileVerifyUrl = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
    const turnstileResult = await fetch(turnstileVerifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: turnstileSecret,
        response: turnstileToken,
      }),
    });

    const turnstileData: TurnstileResponse = await turnstileResult.json();

    if (!turnstileData.success) {
      console.error('Turnstile verification failed:', turnstileData['error-codes']);
      return new Response(
        JSON.stringify({ error: 'Verification failed. Please try again.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Build email content
    const emailSubject = `Contact Form: ${name || 'Anonymous'}`;
    const emailBody = `
New contact form submission:

Name: ${name || 'Not provided'}
Contact Method: ${contactMethod || 'Not provided'}

Message:
${message}

---
Sent from thangqt.com contact form
    `.trim();

    console.log('=== Contact Form Submission ===');
    console.log('Subject:', emailSubject);
    console.log('Body:', emailBody);
    console.log('===============================');

    const emailWorkerUrl = runtime?.env?.EMAIL_WORKER_URL;
    const emailWorkerToken = runtime?.env?.EMAIL_WORKER_TOKEN;

    if (!emailWorkerUrl || !emailWorkerToken) {
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const emailResponse = await fetch(emailWorkerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${emailWorkerToken}`,
      },
      body: JSON.stringify({
        subject: emailSubject,
        body: emailBody,
        contactMethod,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Email worker failed:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to send message. Please try again.' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Message received successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Contact form error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
