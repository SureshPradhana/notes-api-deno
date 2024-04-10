import { Hono } from "https://deno.land/x/hono/mod.ts";
const bybucket = new Hono();
import {
  deleteBucketById,
  getBucketById,
  insertBucket,
  updateBucketById,
} from "../src/db.ts";
bybucket.get("/", async (c) => {
  try {
    const userId = c.req.user.user.id;
    const id = c.req.query("id");
    const data = await getBucketById(userId, id);
    c.status(200);
    return c.json(data);
  } catch (error) {
    console.error(error);
    c.status(500);
    return c.json({ message: "Error getting bucket by ID" });
  }
});

bybucket.put("/", async (c) => {
  try {
    console.log(req);
    const userId = c.req.user.user.id;
    const { _id, content, completed } = await c.req.json();
    const data = await updateBucketById(userId, _id, content, completed);
    c.status(200);
    return c.json(data);
  } catch (error) {
    console.error(error);
    c.status(500);
    return c.json({ message: "Error updating note by ID" });
  }
});

bybucket.post("/", async (c) => {
  try {
    const userId = c.req.user.user.id;
    const { content, completed } = await c.req.json();
    const data = await insertBucket(userId, content, completed);
    c.status(200);
    return c.json(data);
  } catch (error) {
    console.error(error);
    c.status(500);
    return c.json({ message: "Error inserting bucket" });
  }
});

bybucket.delete("/", async (c) => {
  try {
    const userId = c.req.user.user.id;
    const id = c.req.query("id");
    const data = await deleteBucketById(userId, id);
    c.status(200);
    return c.json(data);
  } catch (error) {
    console.error(error);
    c.status(500);
    return c.json({ message: "Error deleting note by ID" });
  }
});

export default bybucket;
