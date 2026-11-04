import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/quickpack";

export async function connectDB(): Promise<typeof mongoose | null> {
  try {
    if (mongoose.connection.readyState >= 1) {
      return mongoose;
    }

    mongoose.set("strictQuery", false);

    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 60000,
      autoIndex: true,
    });

    console.log(
      `[MongoDB] Connected to database: ${conn.connection.name} @ ${conn.connection.host}`
    );

    return conn;
  } catch (error) {
    console.warn(
      `[MongoDB Warning] Could not connect to MongoDB at ${MONGODB_URI}:`,
      (error as Error).message
    );

    console.info(
      `[MongoDB] Tip: Ensure MongoDB is running or specify MONGODB_URI in your .env file.`
    );

    return null;
  }
}

mongoose.connection.on("disconnected", () => {
  console.log("[MongoDB] Disconnected from database");
});

mongoose.connection.on("error", (err) => {
  console.error("[MongoDB Error]:", err.message);
});