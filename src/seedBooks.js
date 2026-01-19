import "dotenv/config";
import mongoose from "mongoose";
import Item from "./models/Item.js";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {});
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

const seedBooks = async () => {
  try {
    await connect();

    // Read books.json
    const booksData = JSON.parse(
      fs.readFileSync(join(__dirname, "books.json"), "utf-8"),
    );

    // Clear existing items
    await Item.deleteMany({});
    console.log("Cleared existing items");

    // Transform books data to match Item schema
    const items = booksData.books.map((book) => ({
      name: book.name,
      author: book.author,
      price: book.price,
      details: book.description,
      rating: Math.floor(Math.random() * 3) + 3, // Random rating between 3-5
      comments: [],
    }));

    // Insert items
    const result = await Item.insertMany(items);
    console.log(
      `Successfully inserted ${result.length} items into the database`,
    );

    mongoose.connection.close();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Error seeding books:", error);
    mongoose.connection.close();
    process.exit(1);
  }
};

seedBooks();
