import unirest from "unirest";

export const sendSMSUsingSNS = async (otp, ownerContact) => {
  if (process.env.SKIP_OTP === "true") {
    console.log(`Skipping SMS. OTP for ${ownerContact} is: ${otp}`);
    return otp;
  }

  if (!ownerContact || ownerContact.trim().length !== 10) {
    throw new Error("Invalid owner contact number");
  }

  const formattedNumber = ownerContact.trim();
  const apiKey = process.env.FAST2SMS_API_KEY;

  const req = unirest("GET", "https://www.fast2sms.com/dev/bulkV2");

  req.query({
    authorization: apiKey,
    route: "q", 
    message: `Your BNC Motors verification code is ${otp}`, 
    language: "english",
    numbers: formattedNumber,
  });

  req.headers({
    "cache-control": "no-cache",
  });

  return new Promise((resolve, reject) => {
    req.end((res) => {
      if (res.error || res.status !== 200) {
        console.error("Error sending SMS via Fast2SMS:", res.body || res.error);
        reject(new Error("Failed to send SMS"));
      } else {
        console.log("✅ SMS sent successfully:", res.body);
        resolve(otp);
      }
    });
  });
};
