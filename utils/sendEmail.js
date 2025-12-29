const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    // ✅ Validate email credentials are set
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

    // ✅ Create a transporter using Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // ✅ Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection verified');

    // ✅ Email options
    const mailOptions = {
      from: `"CivicFix" <${process.env.EMAIL_USER}>`,
      to: to.trim(),
      subject,
      text,
      html,
    };

    // ✅ Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${to}:`, info.response);
    return true;

  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    console.error('Full error:', error);
    return false;
  }
};

module.exports = sendEmail;