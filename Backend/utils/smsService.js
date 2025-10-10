import unirest from "unirest";

/**
 * Send SMS using Fast2SMS
 * Supports both OTP and custom messages
 * 
 * @param {string} message - The SMS content to send
 * @param {string} ownerContact - 10-digit recipient number
 * @returns {Promise<void>}
 */
export const sendSMSUsingSNS = async (message, ownerContact) => {
  try {
    // Skip sending SMS in development or testing
    if (process.env.SKIP_OTP === "true") {
      console.log(`Skipping SMS. Message for ${ownerContact}: ${message}`);
      return;
    }

    // Validate input
    if (!ownerContact || ownerContact.trim().length !== 10) {
      throw new Error("Invalid phone number. Must be 10 digits.");
    }

    if (!message || message.trim().length === 0) {
      throw new Error("Message cannot be empty.");
    }

    const formattedNumber = ownerContact.trim();
    const apiKey = process.env.FAST2SMS_API_KEY;

    if (!apiKey) {
      throw new Error("FAST2SMS_API_KEY not found in environment variables.");
    }

    // Initialize request
    const req = unirest("GET", "https://www.fast2sms.com/dev/bulkV2");

    req.query({
      authorization: apiKey,
      route: "q", // 'q' route is used for custom messages
      message,
      language: "english",
      numbers: formattedNumber,
    });

    req.headers({
      "cache-control": "no-cache",
    });

    // Send request and handle response
    await new Promise((resolve, reject) => {
      req.end((res) => {
        if (res.error || res.status !== 200) {
          console.error("Error sending SMS via Fast2SMS:", res.body || res.error);
          reject(new Error("Failed to send SMS"));
        } else {
          console.log(`SMS sent successfully to ${formattedNumber}`);
          console.log("Fast2SMS Response:", res.body);
          resolve();
        }
      });
    });
  } catch (err) {
    console.error("SMS Service Error:", err.message);
    throw err;
  }
};

/**
 * Send OTP SMS (uses a pre-defined format)
 * 
 * @param {string} otp - One-Time Password to send
 * @param {string} ownerContact - 10-digit recipient number
 * @returns {Promise<void>}
 */
export const sendOTPSMS = async (otp, ownerContact) => {
  const message = `Your BNC Motors verification code is ${otp}`;
  await sendSMS(message, ownerContact);
};
