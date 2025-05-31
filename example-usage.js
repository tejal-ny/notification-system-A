const notificationController = require("./controller/notificationController");

// Example 1: Sending an OTP notification
async function sendOTPNotification() {
  const email = "user@example.com";
  const result = await notificationController.sendNotificationByPreference(
    email,
    "otp",
    {
      otpCode: "123456",
      expiryTime: 10,
      serviceName: "MyApp",
    }
  );

  console.log("OTP Notification Result:", JSON.stringify(result, null, 2));
}

// Example 2: Sending a welcome notification
async function sendWelcomeNotification() {
  const email = "alice@example.com";
  const result = await notificationController.sendNotificationByPreference(
    email,
    "welcome",
    {
      serviceName: "MyApp",
      verificationLink: "https://example.com/verify?token=abc123",
      supportEmail: "support@example.com",
    }
  );

  console.log("Welcome Notification Result:", JSON.stringify(result, null, 2));
}

// Example 3: Sending a notification to a user who hasn't opted in
async function sendMarketingNotification() {
  const email = "alice@example.com";
  const result = await notificationController.sendNotificationByPreference(
    email,
    "marketing",
    {
      promotionCode: "SUMMER25",
      expiryDate: "2025-06-30",
    }
  );

  console.log(
    "Marketing Notification Result:",
    JSON.stringify(result, null, 2)
  );
}

// Run the examples
async function runExamples() {
  console.log("Running notification examples...\n");

  await sendOTPNotification();
  console.log("\n-------------------\n");

  await sendWelcomeNotification();
  console.log("\n-------------------\n");

  await sendMarketingNotification();
}

runExamples().catch((error) => {
  console.error("Error running examples:", error);
});

module.exports = {
  sendOTPNotification,
};
