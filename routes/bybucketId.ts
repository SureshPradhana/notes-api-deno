import { Hono } from "https://deno.land/x/hono/mod.ts";
const bybucketId = new Hono();

import { deleteBucketById, getBucketById } from "../src/db.ts";

// Example route 1
bybucketId.get("/", async (c) => {
  try {
    const userId = c.req.user.user.id;
    const id = c.req.query("_id");
    const data = await getBucketById(userId, id);
    c.status(200);
    return c.json(data);
  } catch (error) {
    console.error(error);
    c.status(500);
    return c.json({ message: "Error getting note by ID" });
  }
});

// Delete note by _id
bybucketId.delete("/", async (c) => {
  try {
    const userId = c.req.user.user.id;
    const { _id } = await c.req.json();
    const data = await deleteBucketById(userId, _id);
    c.status(200);
    return c.json(data);
  } catch (error) {
    console.error(error);
    c.status(500);
    return c.json({ message: "Error deleting note by ID" });
  }
});

export default bybucketId;
