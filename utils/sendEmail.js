const nodemailer = require('nodemailer');

// Retry logic for Render compatibility
const sendEmailWithRetry = async (transporter, mailOptions, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📧 Attempt ${attempt}/${maxRetries} to send email...`);
      const info = await transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`❌ Attempt ${attempt} failed:`, error.message);
      
      if (attempt < maxRetries) {
        // Wait before retrying (exponential backoff)
        const waitTime = Math.pow(2, attempt) * 1000;
        console.log(`⏳ Retrying in ${waitTime / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        throw error;
      }
    }
  }
};

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    // ✅ Validate Gmail credentials
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ EMAIL_USER or EMAIL_PASS not set in environment variables');
      return false;
    }

    // ✅ Validate recipient email
    if (!to) {
      console.error('❌ No recipient email provided');
      return false;
    }

    console.log(`📧 Preparing to send email to: ${to}`);

    // ✅ Create transporter using Gmail SMTP (Render-compatible configuration)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Must be 16-char App Password, not regular password
      },
      connectionTimeout: 30000, // 30 seconds for Render
      socketTimeout: 30000,
      maxConnections: 1,
      maxMessages: 5,
      rateDelta: 1000,
      rateLimit: 5,
    });

    // ✅ Create professional HTML email template
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

    // ✅ Email options
    const mailOptions = {
      from: `"CivicFix" <${process.env.EMAIL_USER}>`,
      to: to.trim(),
      subject,
      text,
      html: emailHtml,
      replyTo: process.env.ADMIN_EMAIL || 'admin@civicfix.com',
    };

    // ✅ Send email with retry logic (Render-compatible)
    const result = await sendEmailWithRetry(transporter, mailOptions, 3);

    console.log(`✅ Email sent successfully to ${to}:`, result.messageId);
    return true;

  } catch (error) {
    console.error('❌ Error sending email:', error.message);

    // Provide helpful error messages for debugging
    if (error.message.includes('Invalid login')) {
      console.error('❌ Invalid Gmail credentials:');
      console.error('   - Make sure EMAIL_USER is correct (civicfix17@gmail.com)');
      console.error('   - EMAIL_PASS must be 16-character Google App Password');
      console.error('   - NOT your regular Gmail password');
      console.error('   - Get it from: https://myaccount.google.com/apppasswords');
    } else if (error.message.includes('ETIMEDOUT') || error.message.includes('ECONNREFUSED')) {
      console.error('⚠️ Connection timeout - this might work on retry');
      console.error('   Check your network or Gmail account security settings');
    } else if (error.message.includes('blocked')) {
      console.error('❌ Gmail blocked the connection');
      console.error('   - Enable "Less secure apps" OR');
      console.error('   - Use 2-Step Verification + App Password');
    }

    return false;
  }
};

module.exports = sendEmail;