import { Hono } from "https://deno.land/x/hono/mod.ts";

import { verify } from "https://deno.land/x/djwt/mod.ts";
const validate = new Hono();

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
    console.error("Error importing key:", error);
    await kv.delete(["my-key"]);
    throw new Error("Failed to import key, the key has been deleted.");
  }
}

const key = await getKey();

validate.get("/", async (c) => {
  const token = c.req.header("authorization");
  if (!token) {
    c.status(401);
    return c.json({ message: "Unauthorized" });
  }

  const payload = await verify(token, key);

  if (!payload) {
    c.status(403);
    return c.json({ message: "Forbidden" });
  }
  c.status(200);
  return c.json(payload);
});

export default validate;
