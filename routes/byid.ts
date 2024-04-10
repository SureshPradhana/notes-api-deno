import { Hono } from "https://deno.land/x/hono/mod.ts";
const byid = new Hono();

import { deleteNoteById, getNoteById } from "../src/db.ts";

// Example route 1
byid.get("/", async (c) => {
  try {
    const userId = c.user.user.id;
    const id = c.req.query("_id");
    const data = await getNoteById(userId, id);
    c.status(200);
    return c.json(data);
  } catch (error) {
    console.error(error);
    c.status(500);
    return c.json({ message: "Error getting note by ID" });
  }
});

// Delete note by _id
byid.delete("/", async (c) => {
  try {
    const userId = c.user.user.id;
    const { _id } = await c.req.json();
    console.log(_id);
    const data = await deleteNoteById(userId, _id);
    c.status(200);
    return c.json(data);
  } catch (error) {
    console.error(error);
    c.status(500);
    return c.json({ message: "Error deleting note by ID" });
  }
});

export default byid;
