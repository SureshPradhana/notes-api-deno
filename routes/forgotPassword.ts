import { Hono } from "https://deno.land/x/hono/mod.ts";
import sgMail from "npm:@sendgrid/mail";

import { createResetToken, getUserByEmail } from "../models/User.ts";
import { create, getNumericDate } from "https://deno.land/x/djwt/mod.ts";
const forgotPasword = new Hono();
let uri = "https://localhost:27017";
let sendgridApiKey;
let fromEmail;
let baseURL;

export async function loadEnvFromDotenv() {
  const { load } = await import("https://deno.land/std@0.221.0/dotenv/mod.ts");
  const env = await load();
  uri = env["MONGO_URI"];
  sendgridApiKey = env["SENDGRID_API_KEY"];
  fromEmail = env["GMAIL"];
  baseURL = env["BASEURL"];
}

const kv = await Deno.openKv();

if (Deno.args.includes("--local")) {
  await loadEnvFromDotenv();
} else {
  uri = Deno.env.get("MONGO_URI");
  sendgridApiKey = Deno.env.get("SENDGRID_API_KEY");
  fromEmail = Deno.env.get("GMAIL");
  baseURL = Deno.env.get("BASEURL");
}

async function checkExistence() {
  const exists = await kv.get(["my-key"]);
  if (
    exists.key === null || exists.key === undefined ||
    exists.value === null || exists.value === undefined ||
    exists.value === ""
  ) {
    const key = await crypto.subtle.generateKey(
      { name: "HMAC", hash: "SHA-512" },
      true,
      ["sign", "verify"],
    );
    const exp = await crypto.subtle.exportKey(
      "raw",
      key,
    );

    await kv.set(["my-key"], exp);
    return exp;
  } else {
    return exists.value;
  }
}
async function getKey() {
  try {
    const key = await checkExistence();
    const importedKey = await crypto.subtle.importKey(
      "raw",
      key,
      { name: "HMAC", hash: "SHA-512" },
      true,
      ["sign", "verify"],
    );
    return importedKey;
  } catch (error) {
    // If an error occurs during importKey, delete the stored key
    await kv.delete(["my-key"]);
    throw new Error("Failed to import key, the key has been deleted.");
  }
}

const key = await getKey();

// Email options

// Reset password link with token

// Send email
forgotPasword.post("/", async (c) => {
  let { email } = await c.req.json();
  let toMail = email;
  const data = await getUserByEmail(toMail);
  if (!data) {
    c.status(404);
    return c.json({ message: "User not found" });
  }

  let exp = getNumericDate(60 * 10);
  const token = await create({ alg: "HS512", typ: "JWT" }, {
    user: { userId: data._id },
    exp: exp,
  }, key);

  await createResetToken(data._id, token);
  const resetLink = `${baseURL}/reset-password?token=${token}`;

  sgMail.setApiKey(sendgridApiKey);
  const msg = {
    to: toMail, // Change to your recipient
    from: fromEmail, // Change to your verified sender
    text: "reset password",
    subject: "Password Reset", // Email subject
    html: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Reset Your Password</title>
<style>

  body {
        margin: 0;
        padding: 0;
        font-family: Arial, sans-serif;
        background-color: #333;
        color: #fff;
        text-align: center;
    }
    .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
    }
    .button {
        display: inline-block;
        padding: 10px 20px;
        margin: 20px 0;
        background-color: #007BFF;
        color: #ffffff !important;
        text-decoration: none;
        border-radius: 5px;
        font-size: 18px;
    }
    .footer {
        font-size: 12px;
        color: #cccccc;
    }
    .important-note {
        color: #FFCC00; /* Yellow color for importance */
        font-size: 12px;
        margin-top: 20px;n-top: 20px;
    }
</style>
</head>
<body>
    <div class="container">
        <h1>Password Reset Request</h1>
        <p>If you requested a password reset for your account, please click the button below. If you did not make this request, please ignore this email.</p>
        <a href="${resetLink}" class="button">Reset Password</a>
        <p class="footer">If the button above does not work, paste the following URL into your browser:</p>
        <p class="footer">${resetLink}</p>
        <p class="important-note">Note: This password reset link will expire in 10 minutes. Please do not share this link with anyone.</p>
    </div>
</body>
</html>
`, // Email body with reset link
  };

  try {
    await sgMail.send(msg);
    c.status(200);
    return c.json({ message: "password reset link sent to your email" });
  } catch (error) {
    c.status(500);
    return c.json({ message: "Error sending email" });
  }
});

export default forgotPasword;
