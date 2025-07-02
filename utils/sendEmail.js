const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    console.log('Preparing to send email to:', to); // Add this
    // Create a transporter using your email service and credentials
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,      // Your email address
        pass: process.env.EMAIL_PASS,      // Your email app password
      },
    });

    // Email options
    const mailOptions = {
      from: `"CivicFix" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response); // Add this
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

module.exports = sendEmail;