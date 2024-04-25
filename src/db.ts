import { MongoClient, ObjectId } from "npm:mongodb";

const dbName = "notes";

const uri = Deno.env.get("MONGO_URI") || "mongodb://localhost:27017";

const client = new MongoClient(uri);

async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB", error);
  }
}

async function disconnectFromMongoDB() {
  try {
    await client.close();
  } catch (error) {
    console.error("Error disconnecting from MongoDB", error);
  }
}

async function getNotesCollection() {
  const db = client.db(dbName);
  return db.collection("notes");
}

async function getBucketListCollection() {
  const db = client.db(dbName);
  return db.collection("bucketlist");
}

async function getCardsCollection() {
  const db = client.db(dbName);
  return db.collection("cards");
}

async function insertBucket(userId, data, completed) {
  try {
    const buckets = await getBucketListCollection();
    const date = new Date();
    const jsonData = {
      userId: userId,
      content: data,
      completed: completed,
      date: date,
    };

    const result = await buckets.insertOne(jsonData);
    return result;
  } catch (error) {
    throw new Error("Error inserting ");
  }
}

async function insertNote(userId, data, tags = []) {
  try {
    const notes = await getNotesCollection();
    let tagslist = tags;
    const date = new Date();
    const jsonData = {
      userId: userId,
      content: data,
      date: date,
      tags: tagslist,
    };

    const result = await notes.insertOne(jsonData);
    console.log("Note inserted successfully");
    return result;
  } catch (error) {
    console.error("Error inserting note", error);
    throw new Error("Error inserting note");
  }
}

async function insertCard(userId, data, title, tags = []) {
  try {
    const notes = await getCardsCollection();
    let tagslist = tags;
    const date = new Date();
    const jsonData = {
      userId: userId,
      content: data,
      date: date,
      title: title,
      tags: tagslist,
    };

    const result = await notes.insertOne(jsonData);
    console.log("Note inserted successfully");
    return result;
  } catch (error) {
    console.error("Error inserting note", error);
    throw new Error("Error inserting note");
  }
}

async function getAllBuckets(userId) {
  try {
    const buckets = await getBucketListCollection();
    return await buckets.find({ userId: userId }).toArray();
  } catch (error) {
    console.error("Error getting all notes", error);
    throw new Error("Error getting all notes");
  }
}

async function getAllNotes(userId) {
  try {
    const notes = await getNotesCollection();
    return await notes.find({ userId: userId }).toArray();
  } catch (error) {
    console.error("Error getting all notes", error);
    throw new Error("Error getting all notes");
  }
}

async function getAllCards(userId) {
  try {
    const notes = await getCardsCollection();
    return await notes.find({ userId: userId }).toArray();
  } catch (error) {
    console.error("Error getting all notes", error);
    throw new Error("Error getting all notes");
  }
}

async function getBucketById(userId, id) {
  try {
    const buckets = await getBucketListCollection();
    return await buckets.findOne({ _id: new ObjectId(id), userId: userId });
  } catch (error) {
    console.error("Error getting note by ID", error);
    throw new Error("Error getting note by ID");
  }
}

async function getNoteById(userId, id) {
  try {
    const notes = await getNotesCollection();
    return await notes.findOne({ _id: new ObjectId(id), userId: userId });
  } catch (error) {
    console.error("Error getting note by ID", error);
    throw new Error("Error getting note by ID");
  }
}

async function getCardById(userId, id) {
  try {
    const notes = await getCardsCollection();
    return await notes.findOne({ _id: new ObjectId(id), userId: userId });
  } catch (error) {
    console.error("Error getting note by ID", error);
    throw new Error("Error getting note by ID");
  }
}

async function getNoteByContent(userId, content) {
  try {
    const notes = await getNotesCollection();
    const regexSearchTerm = new RegExp(content, "i");
    const query = { content: { $regex: regexSearchTerm }, userId: userId };
    return await notes.find(query).toArray();
  } catch (error) {
    console.error("Error getting notes", error);
    throw new Error("Error getting Note By cotent");
  }
}
async function updateBucketById(userId, _id, content, completed) {
  try {
    const newData = { content, completed };
    const buckets = await getBucketListCollection();
    const result = await buckets.updateOne({
      _id: new ObjectId(_id),
      userId: userId,
    }, { $set: newData });
    console.log("Note updated successfully");
    return result.modifiedCount;
  } catch (error) {
    console.error("Error updating note by ID", error);
    throw new Error("Error Updating note by ID");
  }
}

async function updateNoteById(userId, _id, content, tags) {
  try {
    const newData = { content, tags };
    const notes = await getNotesCollection();
    const result = await notes.updateOne({
      _id: new ObjectId(_id),
      userId: userId,
    }, { $set: newData });
    console.log("Note updated successfully");
    return result.modifiedCount;
  } catch (error) {
    console.error("Error updating note by ID", error);
    throw new Error("Error Updating note by ID");
  }
}

async function updateCardById(userId, _id, content, title, tags) {
  try {
    const newData = { content, title, tags };
    const notes = await getCardsCollection();
    const result = await notes.updateOne({
      _id: new ObjectId(_id),
      userId: userId,
    }, { $set: newData });
    console.log("Note updated successfully");
    return result.modifiedCount;
  } catch (error) {
    console.error("Error updating note by ID", error);
    throw new Error("Error Updating note by ID");
  }
}

async function deleteBucketById(userId, id) {
  try {
    const buckets = await getBucketListCollection();
    const result = await buckets.deleteOne({
      _id: new ObjectId(id),
      userId: userId,
    });
    return result.deletedCount; // Return the number of deleted documents
  } catch (error) {
    console.error("Error deleting note by ID", error);
    throw new Error("Error deleting note by id");
  }
}

async function deleteNoteById(userId, id) {
  try {
    const notes = await getNotesCollection();
    const result = await notes.deleteOne({
      _id: new ObjectId(id),
      userId: userId,
    });
    return result.deletedCount; // Return the number of deleted documents
  } catch (error) {
    console.error("Error deleting note by ID", error);
    throw new Error("Error deleting note by id");
  }
}
async function deleteCardById(userId, id) {
  try {
    const notes = await getCardsCollection();
    const result = await notes.deleteOne({
      _id: new ObjectId(id),
      userId: userId,
    });
    return result.deletedCount; // Return the number of deleted documents
  } catch (error) {
    console.error("Error deleting note by ID", error);
    throw new Error("Error deleting note by id");
  }
}

async function deleteAllNotes(userId) {
  try {
    const notes = await getNotesCollection();
    const result = await notes.deleteMany({ userId: userId });
    console.log("All notes deleted successfully");
    return result.deletedCount;
  } catch (error) {
    console.error("Error deleting all notes", error);
    throw new Error("Error deleteing notes");
  }
}

// find by tags

async function getNoteByTags(userId, tags) {
  try {
    const notes = await getNotesCollection();
    return await notes.find({ userId: userId, tags: { $in: tags } }).toArray();
  } catch (error) {
    console.error("Error getting notes by tags", error);
    throw new Error("Error getting notes by id");
  }
}

// find by date
async function getNoteByDate(userId, date) {
  try {
    const notes = await getNotesCollection();
    return await notes.find({
      userId: userId,
      date: {
        $gte: new Date(date),
      },
    }).toArray();
  } catch (error) {
    console.error("Error getting notes by date", error);
    throw new Error("Error getting notes by date");
  }
}

async function getCardByDate(userId, date) {
  try {
    const notes = await getCardsCollection();
    return await notes.find({
      userId: userId,
      date: {
        $gte: new Date(date),
      },
    }).toArray();
  } catch (error) {
    console.error("Error getting notes by date", error);
    throw new Error("Error getting notes by date");
  }
}

export {
  connectToMongoDB,
  deleteAllNotes,
  deleteBucketById,
  deleteCardById,
  deleteNoteById,
  disconnectFromMongoDB,
  getAllBuckets,
  getAllCards,
  getAllNotes,
  getBucketById,
  getBucketListCollection,
  getCardByDate,
  getCardById,
  getNoteByContent,
  getNoteByDate,
  getNoteById,
  getNoteByTags,
  insertBucket,
  insertCard,
  insertNote,
  updateBucketById,
  updateCardById,
  updateNoteById,
};
