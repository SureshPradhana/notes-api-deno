import { Hono } from "https://deno.land/x/hono/mod.ts";
import { getAllNotes } from "../src/db.ts";
const notes = new Hono();

notes.get("/", async (c) => {
  try {
    const userId = c.user.user.id;
    console.log(c);
    const data = await getAllNotes(userId);
    c.status(200);
    return c.json(data);
  } catch (error) {
    console.error(error);
    c.status(500);
  }
});
export default notes;
