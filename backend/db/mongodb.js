import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

export const connectDB = async (params) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Mongodb connected.");
  } catch (error) {
    console.error("Error connecting mongodb.");
    process.exit(1);
  }
};

export const clone = async (oldUri, newUri) => {
  const oldConn = mongoose.createConnection(oldUri);
  const newConn = mongoose.createConnection(newUri);
  await oldConn.asPromise();
  await newConn.asPromise();

  const collections = await oldConn.db.listCollections().toArray();

  for (let coll of collections) {
    const name = coll.name;

    console.log("Copying:", name);

    const oldCollection = oldConn.db.collection(name);
    const newCollection = newConn.db.collection(name);

    const docs = await oldCollection.find({}).toArray();

    if (docs.length > 0) {
      await newCollection.insertMany(docs);
    }
  }

  console.log("Done!");
};
