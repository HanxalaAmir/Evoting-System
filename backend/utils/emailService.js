const axios = require('axios');

const sendEmailOTP = async (email, otp, type) => {
  const url = 'https://api.brevo.com/v3/smtp/email';

  const subject = type === 'register'
    ? 'Verify Your Admin Account - UniVoting'
    : 'Reset Your Password - UniVoting';

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
      <div style="padding: 24px; text-align: center; background-color: #ffffff; border-bottom: 1px solid #e5e7eb; border-radius: 8px 8px 0 0;">
        <h2 style="color: #4f46e5; margin: 0; font-size: 24px;">UniVoting Security</h2>
      </div>
      
      <div style="padding: 32px 24px; background-color: #ffffff;">
        <p style="color: #374151; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
          Hello,
        </p>
        <p style="color: #374151; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
          Use the code below to complete your ${type} request.
        </p>
        
        <div style="background-color: #f3f4f6; border-radius: 8px; padding: 16px; text-align: center; margin: 32px 0;">
          <span style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #111827;">
            ${otp}
          </span>
        </div>

        <p style="color: #6b7280; font-size: 14px; text-align: center;">
          This code expires in 10 minutes.
        </p>
      </div>
    </div>
  `;

  try {
    await axios.post(
      url,
      {
        sender: { name: 'UniVoting Security', email: process.env.EMAIL_FROM },
        to: [{ email: email }],
        subject: subject,
        htmlContent: htmlContent,
      },
      {
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
    );

    return true;

  } catch (error) {
    throw new Error('Failed to send verification email.');
  }
};

module.exports = { sendEmailOTP };