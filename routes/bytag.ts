import { Hono } from "https://deno.land/x/hono/mod.ts";
import { getNoteByTags } from "../src/db.ts";
const bytag = new Hono();

// Example route 1
bytag.get("/", async (c) => {
  try {
    const userId = c.user.user.id;
    const tag = c.req.query("tag");
    const data = await getNoteByTags(userId, tag);
    c.status(200);
    return c.json(data);
  } catch (error) {
    console.error(error);
    c.status(500);
    return c.json({ message: "Error getting note by tags" });
  }
});

export default bytag;
