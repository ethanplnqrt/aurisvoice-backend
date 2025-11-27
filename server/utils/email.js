// AurisVoice - Email utility with Brevo
// Sends email alerts via Brevo API

export async function sendEmail(to, subject, html) {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    console.error('❌ BREVO_API_KEY not configured');
    throw new Error('BREVO_API_KEY not configured');
  }

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'AurisVoice Alerts', email: 'alerts@aurisvoice.com' },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(`Brevo API error: ${data.message || res.statusText}`);
    }

    return data;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
}

