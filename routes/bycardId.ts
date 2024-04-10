import { Hono } from "https://deno.land/x/hono/mod.ts";
const bycardId = new Hono();

import { deleteCardById, getCardById } from "../src/db.ts";

// Example route 1
bycardId.get("/", async (c) => {
  try {
    const userId = c.req.user.id;
    const id = c.req.query("_id");
    const data = await getCardById(userId, id);
    c.status(200);
    return c.json(data);
  } catch (error) {
    console.error(error);
    c.status(500);
    return c.json({ message: "Error getting note by ID" });
  }
});

// Delete note by _id
bycardId.delete("/", async (c) => {
  try {
    const userId = c.req.user.id;
    const { _id } = await c.req.json();
    const data = await deleteCardById(userId, _id);
    c.status(200);
    return c.json(data);
  } catch (error) {
    console.error(error);
    c.status(500);
    return c.json({ message: "Error deleting note by ID" });
  }
});
export default bycardId;
