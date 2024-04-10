import { Hono } from "https://deno.land/x/hono/mod.ts";
const resetPassword = new Hono();
resetPassword.get("/", (c) => c.text("List Books")); // GET /book
resetPassword.post("/", (c) => c.text("Create Book"));

export default resetPassword;
