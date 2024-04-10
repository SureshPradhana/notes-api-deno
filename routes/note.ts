import { Hono } from "https://deno.land/x/hono/mod.ts";

import {
  deleteNoteById,
  getNoteById,
  insertNote,
  updateNoteById,
} from "../src/db.ts";
const note = new Hono().basePath("/api/note");

note.get("/", async (c) => {
  try {
    const userId = c.user.user.id;
    const id = c.req.query("id");
    const data = await getNoteById(userId, id);
    c.status(200);
    return c.json(data);
  } catch (error) {
    console.error(error);
    c.status(500).c.status(500);
    return json({ message: "Error getting note by ID" });
  }
});
note.put("/", async (c) => {
  console.log("kdjskdj");
  try {
    const userId = c.user.user.id;
    console.log("ohh");
    const { _id, content, tags } = await c.req.json();
    console.log(userId, _id, content, tags);
    const data = await updateNoteById(userId, _id, content, tags);
    c.status(200);
    return c.json(data);
  } catch (error) {
    console.error(error);
    c.status(500);
    return c.json({ message: "Error updating note by ID" });
  }
});
note.post("/", async (c) => {
  try {
    const userId = c.user.user.id;
    const { content, tags } = await c.req.json();
    const data = await insertNote(userId, content, tags);
    c.status(201);
    return c.json(data);
  } catch (error) {
    console.error(error);
    c.status(500);
    return c.json({ message: "Error inserting note" });
  }
});

// note.delete("/", async (c) => {
//   try {
//     const userId = c.user.user.id;
//     const id = c.req.query("id");
//     console.log(userId, id);
//     const data = await deleteNoteById(userId, id);
//     c.status(200);
//     return c.json(data);
//   } catch (error) {
//     console.error(error);
//     c.status(500);
//     return c.json({ message: "Error deleting note by ID" });
//   }
// });
export default note;
