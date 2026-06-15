const nodemailer = require("nodemailer");

// Initialize Mail Transporter
let transporter;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);

if (smtpUser && smtpPass) {
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
} else {
  console.log("⚠️ SMTP credentials not found. Mail service running in MOCK mode.");
}

/**
 * Sends a real-time email.
 * @param {string} to recipient email address
 * @param {string} subject email subject
 * @param {string} text plain text body
 * @param {string} html optional HTML body
 */
const sendRealTimeEmail = async (to, subject, text, html) => {
  try {
    console.log(`[REAL-TIME EMAIL] Sending to: ${to} | Subject: ${subject}`);
    if (transporter) {
      const mailOptions = {
        from: `"CropAdvisor Alert Portal" <${smtpUser}>`,
        to,
        subject,
        text,
        html: html || text,
      };
      await transporter.sendMail(mailOptions);
      console.log(`[REAL-TIME EMAIL] Successfully sent email to ${to}`);
      return { success: true, mode: "smtp" };
    } else {
      console.log(`[MOCK EMAIL LOG]
To: ${to}
Subject: ${subject}
Content: ${text}`);
      return { success: true, mode: "mock" };
    }
  } catch (error) {
    console.error(`[REAL-TIME EMAIL ERROR] Failed to send email to ${to}:`, error.message);
    // Don't crash the server/request, just return success false
    return { success: false, error: error.message };
  }
};

/**
 * Sends a real-time SMS.
 * @param {string} to phone number (digits)
 * @param {string} message SMS content
 */
const sendRealTimeSMS = async (to, message) => {
  try {
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    console.log(`[REAL-TIME SMS] Sending to: ${to} | Msg: ${message}`);

    if (twilioSid && twilioAuthToken && twilioPhone) {
      // Dynamic import to avoid crash if not installed
      const twilio = require("twilio");
      const client = twilio(twilioSid, twilioAuthToken);
      await client.messages.create({
        body: message,
        from: twilioPhone,
        to: to.startsWith("+") ? to : `+91${to}`, // assuming Indian country code as default if missing
      });
      console.log(`[REAL-TIME SMS] Successfully sent SMS to ${to}`);
      return { success: true, mode: "twilio" };
    } else {
      console.log(`[MOCK SMS LOG]
To: ${to}
Message: ${message}`);
      return { success: true, mode: "mock" };
    }
  } catch (error) {
    console.error(`[REAL-TIME SMS ERROR] Failed to send SMS to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendRealTimeEmail,
  sendRealTimeSMS,
};
