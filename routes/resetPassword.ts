import { Hono } from "https://deno.land/x/hono/mod.ts";
import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";

import {
  deleteResetToken,
  findResetTokenByToken,
  getUserById,
  updateUserPassword,
} from "../models/User.ts";

import { verify } from "https://deno.land/x/djwt/mod.ts";
const kv = await Deno.openKv();
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

const resetPassword = new Hono();
resetPassword.get("/", (c) => c.text("List Books")); // GET /book
resetPassword.post("/", async (c) => {
  const { token, password } = await c.req.json();
  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }
  try {
    const resetToken = await findResetTokenByToken(token); // Find the reset token
    if (!resetToken) {
      c.status(400);
      return c.json({ message: "Invalid or expired token" });
    }
    const decoded = await verify(token, key);
    // Optionally, check if the userId exists in the database
    const user = await getUserById(decoded.user.userId);
    if (!user) {
      c.status(404);
      return c.json({ message: "User not found" });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    await updateUserPassword(decoded.user.userId, hashedPassword);
    await deleteResetToken(token);
    c.status(200);
    return c.json({ message: "Password has been successfully reset" });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      c.status(401);
      return c.json({ message: "Token has expired" });
    } else if (error.name === "JsonWebTokenError") {
      c.status(401);
      return c.json({ message: "Invalid token" });
    } else {
      c.status(500);
      return c.json({ message: "Could not reset password" });
    }
  }
});

export default resetPassword;
