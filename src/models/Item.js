import mongoose from "mongoose";
const { Schema } = mongoose;

const itemSchema = new Schema(
  {
    name: { type: String, required: true },
    author: { type: String },
    image: { type: String },

    rating: { type: Number, min: 0, max: 5 },
    price: { type: Number, required: true },

    details: { type: String },

    comments: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        rating: { type: Number, min: 0, max: 5 },
        comment: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model("Item", itemSchema);
