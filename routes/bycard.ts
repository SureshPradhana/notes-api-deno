import { Hono } from "https://deno.land/x/hono/mod.ts";
const bycard = new Hono();
import {
  deleteCardById,
  getCardById,
  insertCard,
  updateCardById,
} from "../src/db.ts";
bycard.get("/", async (c) => {
  try {
    const userId = c.req.user.user.id;
    const id = c.req.query("id");
    const data = await getCardById(userId, id);
    c.status(200);
    return c.json(data);
  } catch (error) {
    console.error(error);
    c.status(500);
    return c.json({ message: "Error getting bucket by ID" });
  }
});

bycard.put("/", async (c) => {
  try {
    console.log(req);
    const userId = c.req.user.user.id;
    const { _id, content, title, tags } = await c.req.json();
    const data = await updateCardById(userId, _id, content, title, tags);
    c.status(200);
    return c.json(data);
  } catch (error) {
    console.error(error);
    c.status(500);
    return c.json({ message: "Error updating note by ID" });
  }
});

bycard.post("/", async (c) => {
  try {
    const userId = c.req.user.user.id;
    const { content, title, tags } = await c.req.json();
    const data = await insertCard(userId, content, title, tags);
    c.status(201);
    return c.json(data);
  } catch (error) {
    console.error(error);
    c.status(500);
    return c.json({ message: "Error inserting bucket" });
  }
});

bycard.delete("/", async (c) => {
  try {
    const userId = c.req.user.user.id;
    const id = c.req.query("id");
    const data = await deleteCardById(userId, id);
    c.status(200);
    return c.json(data);
  } catch (error) {
    console.error(error);
    c.status(500);
    return c.json({ message: "Error deleting note by ID" });
  }
});

export default bycard;
