/**
 * Tests for email validation
 *
 * To run: node tests/email.test.js
 */

const { validateEmailInput } = require("../notifications/email");
const { isValidEmail } = require("../utilities/validators");

// Test email validation function
console.log("\n=== Testing Email Validation ===\n");

// Test valid email formats
const validEmails = [
  "simple@example.com",
  "very.common@example.com",
  "disposable.style.email.with+symbol@example.com",
  "other.email-with-hyphen@example.com",
  "fully-qualified-domain@example.com",
  "user.name+tag+sorting@example.com",
  "x@example.com",
  "example-indeed@strange-example.com",
  "example@s.example",
  '"very.(),:;<>[]".VERY."very@\\ "very".unusual"@strange.example.com',
  "example@example.com",
  "admin@mailserver1",
  "1234567890@example.com",
  "email@example-one.com",
  "_______@example.com",
];

// Test invalid email formats
const invalidEmails = [
  "Abc.example.com", // no @ character
  "A@b@c@example.com", // multiple @ characters
  'a"b(c)d,e:f;g<h>i[jk]l@example.com', // special characters not in quotes
  'just"not"right@example.com', // quoted strings must be dot-separated
  'this is"notallowed@example.com', // spaces not in quotes
  'this\\ still\\"not\\allowed@example.com', // escaped characters not in quotes
  "i_like_underscore@but_its_not_allowed_in_this_part.example.com", // underscore in domain part
  "notanemail",
  "@noaddress.com",
  "email@",
  "email@example", // no TLD
  "",
  null,
  undefined,
];

// Test the isValidEmail function
console.log("Testing isValidEmail function:");
console.log("-----------------------------");
console.log("Valid emails should return true:");
validEmails.forEach((email) => {
  const result = isValidEmail(email);
  console.log(`"${email}" -> ${result ? "✅ VALID" : "❌ INVALID (ERROR)"}`);
});

console.log("\nInvalid emails should return false:");
invalidEmails.forEach((email) => {
  const result = isValidEmail(email);
  console.log(`"${email}" -> ${result ? "❌ VALID (ERROR)" : "✅ INVALID"}`);
});

// Test the complete validation function
console.log("\n\nTesting complete email validation:");
console.log("--------------------------------");

// Test cases for validateEmailInput
const testCases = [
  {
    name: "All valid inputs",
    params: {
      to: "user@example.com",
      subject: "Test Subject",
      body: "Test Body",
    },
    expectedValid: true,
  },
  {
    name: "Invalid email",
    params: {
      to: "not-an-email",
      subject: "Test Subject",
      body: "Test Body",
    },
    expectedValid: false,
  },
  {
    name: "Empty subject",
    params: {
      to: "user@example.com",
      subject: "",
      body: "Test Body",
    },
    expectedValid: false,
  },
  {
    name: "Empty body",
    params: {
      to: "user@example.com",
      subject: "Test Subject",
      body: "",
    },
    expectedValid: false,
  },
  {
    name: "Multiple errors",
    params: {
      to: "invalid",
      subject: "",
      body: null,
    },
    expectedValid: false,
  },
];

// Run test cases
testCases.forEach((test) => {
  const { to, subject, body } = test.params;
  const validation = validateEmailInput(to, subject, body);

  console.log(`\nTest: ${test.name}`);
  console.log(`  Email: "${to}"`);
  console.log(`  Subject: "${subject}"`);
  console.log(`  Body: ${body === null ? "null" : `"${body}"`}`);
  console.log(`  Valid: ${validation.isValid ? "✅ YES" : "❌ NO"}`);

  if (!validation.isValid) {
    console.log(`  Errors: ${validation.errors.join("; ")}`);
  }

  if (validation.isValid !== test.expectedValid) {
    console.log(
      `  ❌ TEST FAILED: Expected valid=${test.expectedValid}, got valid=${validation.isValid}`
    );
  } else {
    console.log(`  ✅ TEST PASSED`);
  }
});
