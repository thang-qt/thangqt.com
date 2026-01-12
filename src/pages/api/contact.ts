import type { APIRoute } from 'astro';

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

    // For now, log the message (email sending requires Email Routing setup on CF)
    // In production, you would use CF Email Workers here
    console.log('=== Contact Form Submission ===');
    console.log('Subject:', emailSubject);
    console.log('Body:', emailBody);
    console.log('===============================');

    // Check if we have email sending capability
    // CF Email Routing uses the `email` binding - we'll add this when you deploy
    const emailBinding = runtime?.env?.EMAIL;
    
    if (emailBinding) {
      // Send email using Cloudflare Email Routing
      // This requires setting up Email Routing in CF dashboard and adding the binding
      try {
        const emailMessage = new EmailMessage(
          'contact@thangqt.com', // From address (must be configured in Email Routing)
          'thang@thangqt.com',   // To address (your verified email)
          `Subject: ${emailSubject}\r\n\r\n${emailBody}`
        );
        await emailBinding.send(emailMessage);
        console.log('Email sent successfully');
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        // Don't fail the request if email fails - the message was received
      }
    } else {
      console.log('Email binding not available - message logged only');
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

// Cloudflare Email Message class placeholder
// In production, this comes from the CF Workers runtime
declare class EmailMessage {
  constructor(from: string, to: string, raw: string);
}
