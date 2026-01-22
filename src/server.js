import "dotenv/config";
import mongoose from "mongoose";
import app from "./app.js";
// initialize redis client (side-effect import) so we see connection logs at startup
import "./utils/cache.js";

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {});
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};
connect();

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
