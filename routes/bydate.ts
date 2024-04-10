import { Hono } from "https://deno.land/x/hono/mod.ts";
const bydate = new Hono();
bydate.get("/", (c) => c.text("List Books")); // GET /book
bydate.post("/", (c) => c.text("Create Book"));

export default bydate;
