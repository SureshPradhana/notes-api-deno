// models/User.js
import { MongoClient, ObjectId } from "npm:mongodb";

import { load } from "https://deno.land/std@0.221.0/dotenv/mod.ts";
let db;
const env = await load();
const uri = env["MONGO_URI"] || "mongodb://localhost:27017";

async function connectToDatabase() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected to the database");
    db = client.db("notes");
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
}

async function getUserCollection() {
  if (!db) {
    await connectToDatabase();
  }
  return db.collection("users");
}

async function getTokensCollection() {
  if (!db) {
    await connectToDatabase();
  }
  return db.collection("usertokens");
}

async function createUser(email, password) {
  const users = await getUserCollection();
  const result = await users.insertOne({ email, password });
  return result;
}

async function getUserByEmail(email) {
  const users = await getUserCollection();
  return users.findOne({ email });
}
async function getUserById(id) {
  const users = await getUserCollection();
  return users.findOne({ _id: new ObjectId(id) });
}

async function updateUserPassword(id, password) {
  const users = await getUserCollection();
  return users.updateOne({ _id: new ObjectId(id) }, { $set: { password } });
}

async function createResetToken(userId, token) {
  try {
    const collection = await getTokensCollection();
    await collection.insertOne({ userId: new ObjectId(userId), token });
    console.log("Reset token created successfully");
  } catch (error) {
    console.error("Error creating reset token:", error);
    throw error;
  }
}

// Function to find a reset token by token value
async function findResetTokenByToken(token) {
  try {
    const collection = await getTokensCollection();
    return await collection.findOne({ token });
  } catch (error) {
    console.error("Error finding reset token:", error);
    throw error;
  }
}

// Function to delete a reset token
async function deleteResetToken(token) {
  try {
    const collection = await getTokensCollection();
    await collection.deleteOne({ token });
    console.log("Reset token deleted successfully");
  } catch (error) {
    console.error("Error deleting reset token:", error);
    throw error;
  }
}
export {
  connectToDatabase,
  createResetToken,
  createUser,
  deleteResetToken,
  findResetTokenByToken,
  getUserByEmail,
  getUserById,
  getUserCollection,
  updateUserPassword,
};
