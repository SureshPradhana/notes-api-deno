import { Hono } from "https://deno.land/x/hono/mod.ts";
const forgotPasword = new Hono();
forgotPasword.get("/", (c) => c.text("List Books")); // GET /book
forgotPasword.post("/", (c) => c.text("Create Book"));

export default forgotPasword;
