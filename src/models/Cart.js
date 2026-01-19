import mongoose from "mongoose";
const { Schema } = mongoose;

const cartSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    items: [
      {
        itemId: { type: Schema.Types.ObjectId, ref: "Item" },
        quantity: { type: Number, default: 1 }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Cart", cartSchema);
