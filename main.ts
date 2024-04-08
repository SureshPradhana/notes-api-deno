import { Hono } from "https://deno.land/x/hono@v3.4.1/mod.ts";

const app = new Hono();
const kv = await Deno.openKv();

// Redirect root URL
app.get("/", (c) => c.redirect("/books"));

// List all books
app.get("/books", async (c) => {
  const iter = await kv.list({ prefix: ["books"] });
  const books = [];
  for await (const res of iter) books.push(res);

  return c.json(books);
});

// Create a book (POST body is JSON)
app.post("/books", async (c) => {
  const body = await c.req.json();
  const result = await kv.set(["books", body.title], body);
  return c.json(result);
});

// Get a book by title
app.get("/books/:title", async (c) => {
  const title = c.req.param("title");
  const result = await kv.get(["books", title]);
  return c.json(result);
});

// Delete a book by title
app.delete("/books/:title", async (c) => {
  const title = c.req.param("title");
  await kv.delete(["books", title]);
  return c.text("");
});
app.put("/books/:title", async (c) => {
  const title = c.req.param("title");
  const result = await kv.set(["books", title], await c.req.json());
  return c.json(result);
});
Deno.serve(app.fetch);
