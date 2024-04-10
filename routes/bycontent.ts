import { Hono } from "https://deno.land/x/hono/mod.ts";
const bycontent = new Hono();
bycontent.get("/", (c) => c.text("List Books")); // GET /book
bycontent.post("/", (c) => c.text("Create Book"));

export default bycontent;
