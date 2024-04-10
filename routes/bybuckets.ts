import { Hono } from "https://deno.land/x/hono/mod.ts";
import { getAllBuckets } from "../src/db.ts";
const bybuckets = new Hono();
bybuckets.get("/", async (c) => {
  try {
    const userId = c.user.user.id;
    console.log(c);
    const data = await getAllBuckets(userId);
    c.status(200);
    return c.json(data);
  } catch (error) {
    console.error(error);
    c.status(500);
  }
});
export default bybuckets;
