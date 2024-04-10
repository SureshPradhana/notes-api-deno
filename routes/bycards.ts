import { Hono } from "https://deno.land/x/hono/mod.ts";
import { getAllCards } from "../src/db.ts";
const bycards = new Hono();
bycards.get("/", async (c) => {
  try {
    const userId = c.user.user.id;
    console.log(c);
    const data = await getAllCards(userId);
    c.status(200);
    return c.json(data);
  } catch (error) {
    console.error(error);
    c.status(500);
  }
});
export default bycards;
