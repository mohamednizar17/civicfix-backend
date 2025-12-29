const { Resend } = require('resend');

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    // ✅ Validate Resend API key
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY not set in environment variables');
      return false;
    }

    // ✅ Validate recipient email
    if (!to) {
      console.error('❌ No recipient email provided');
      return false;
    }

    console.log(`📧 Preparing to send email to: ${to}`);
    console.log(`📧 Attempting to send email to ${to}`);

    // ✅ Initialize Resend
    const resend = new Resend(process.env.RESEND_API_KEY);

    // ✅ Send email using Resend
    const result = await resend.emails.send({
      from: 'CivicFix <onboarding@resend.dev>', // Use Resend's default domain for free tier
      to: to.trim(),
      subject,
      text,
      html: html || `<p>${text}</p>`,
    });

    // ✅ Check if email was sent successfully
    if (result.error) {
      console.error('❌ Resend Error:', result.error);
      return false;
    }

    console.log(`✅ Email sent successfully to ${to}:`, result.data.id);
    return true;

  } catch (error) {
    console.error('❌ Error sending email:', error.message);

    // Provide helpful error messages
    if (error.message.includes('ETIMEDOUT') || error.message.includes('timeout')) {
      console.error('⚠️ Email timeout');
    } else if (error.message.includes('API')) {
      console.error('❌ Resend API Error - check RESEND_API_KEY in environment');
    }

    return false;
  }
};

module.exports = sendEmail;