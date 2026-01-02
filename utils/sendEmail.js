const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    // ✅ Validate Brevo SMTP credentials
    if (!process.env.BREVO_SMTP_LOGIN || !process.env.BREVO_SMTP_PASSWORD) {
      console.error('❌ BREVO_SMTP_LOGIN or BREVO_SMTP_PASSWORD not set in environment variables');
      return false;
    }

    // ✅ Validate recipient email
    if (!to) {
      console.error('❌ No recipient email provided');
      return false;
    }

    console.log(`📧 Preparing to send email to: ${to}`);
    console.log(`📧 Attempting to send email to ${to}`);

    // ✅ Create transporter using Brevo SMTP
    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false, // TLS
      auth: {
        user: process.env.BREVO_SMTP_LOGIN,
        pass: process.env.BREVO_SMTP_PASSWORD,
      },
      connectionTimeout: 10000,
      socketTimeout: 10000,
    });

    // ✅ Create professional HTML email template if not provided
    const emailHtml = html || `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">CivicFix</h1>
          <p style="color: #e0e7ff; margin: 5px 0 0 0; font-size: 14px;">Community Complaint Management</p>
        </div>
        <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0;">
          <p style="color: #1e293b; font-size: 16px; line-height: 1.6;">${text}</p>
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 12px; margin: 0;">
              © 2025 CivicFix. All rights reserved.<br>
              This is an automated message. Please do not reply directly.
            </p>
          </div>
        </div>
      </div>
    `;

    // ✅ Send email
    const info = await transporter.sendMail({
      from: 'CivicFix <civicfix17@gmail.com>',
      to: to.trim(),
      subject,
      text,
      html: emailHtml,
      replyTo: 'admin@civicfix.com',
    });

    console.log(`✅ Email sent successfully to ${to}:`, info.messageId);
    return true;

  } catch (error) {
    console.error('❌ Error sending email:', error.message);

    // Provide helpful error messages
    if (error.message.includes('Invalid login')) {
      console.error('❌ Invalid Brevo SMTP credentials - check BREVO_SMTP_LOGIN and BREVO_SMTP_PASSWORD');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('❌ Cannot connect to Brevo SMTP - check network');
    }

    return false;
  }
};

module.exports = sendEmail;