import { Hono } from "https://deno.land/x/hono/mod.ts";
import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";
import { create, getNumericDate } from "https://deno.land/x/djwt/mod.ts";
import { cors } from "https://deno.land/x/hono/middleware.ts";
import { verify } from "https://deno.land/x/djwt/mod.ts";
import {
  connectToDatabase,
  createUser,
  getUserByEmail,
} from "./models/User.ts";

import validate from "./routes/validate.ts";

import notes from "./routes/notes.ts";
import note from "./routes/note.ts";
import bytag from "./routes/bytag.ts";
import bydate from "./routes/bydate.ts";
import bycontent from "./routes/bycontent.ts";
import byid from "./routes/byid.ts";

import bybuckets from "./routes/bybuckets.ts";
import bybucket from "./routes/bybucket.ts";
import bybucketId from "./routes/bybucketId.ts";
import bycards from "./routes/bycards.ts";
import bycard from "./routes/bycard.ts";
import bycardId from "./routes/bycardId.ts";
import forgotPassword from "./routes/forgotPassword.ts";
import resetPassword from "./routes/resetPassword.ts";
const kv = await Deno.openKv();
import { rateLimiter } from "npm:hono-rate-limiter";

const limiter = rateLimiter({
  windowMs: 5 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-6", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  keyGenerator: (c) => "<unique_key>", // Method to generate custom identifiers for clients.
  // store: ... , // Redis, MemoryStore, etc. See below.
});

const app = new Hono();

app.use(cors());

app.use(limiter);
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

connectToDatabase();

app.use("/api/*", async (c, next) => {
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
  c.user = payload;
  await next();
});
app.route("/api/validate-token", validate);
app.route("/api/notes", notes);
app.route("/", note);
app.route("/api/bytag", bytag);
app.route("/api/bydate", bydate);
app.route("/api/bycontent", bycontent);
app.route("/api/byid", byid);

app.route("/api/bucketlist/bybuckets", bybuckets);
app.route("/api/bucketlist/bybucket", bybucket);
app.route("/api/bucketlist/bybucketId", bybucketId);

app.route("/api/flashcards/bycards", bycards);
app.route("/api/flashcards/bycard", bycard);
app.route("/api/flashcards/bycardId", bycardId);

app.route("/forgot-password", forgotPassword);
app.route("/reset-password", resetPassword);

// Redirect root URL

app.post("/login", async (c) => {
  const { email, password } = await c.req.json();
  const user = await getUserByEmail(email);
  if (!user) {
    c.status(404);
    return c.json({ message: "User not found" });
  }

  const validPassword = bcrypt.compareSync(password, user.password);
  if (!validPassword) {
    c.status(401);

    return c.json({ message: "Invalid password" });
  }
  let exp = getNumericDate(60 * 60 * 24);
  const token = await create({ alg: "HS512", typ: "JWT" }, {
    user: { id: user._id, email: user.email },
    exp: exp,
  }, key);
  return c.json({ token });
});

app.post("/signup", async (c) => {
  const { email, password } = await c.req.json();

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    c.status(400);
    return c.json({ message: "User already exists" });
  }
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  const result = await createUser(email, hashedPassword);
  if (result) {
    console.log("New user created:", result);
    c.status(200);
    return c.json({ message: "User created" });
  } else {
    c.status(500);
    return c.json({ message: "Error signing up" });
  }
});

Deno.serve(app.fetch);
