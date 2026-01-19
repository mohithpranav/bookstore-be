import mongoose from "mongoose";
const { Schema } = mongoose;

const orderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    items: [
      {
        itemId: { type: Schema.Types.ObjectId, ref: "Item" },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }
      }
    ],

    totalPrice: { type: Number, required: true },

    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"],
      default: "PENDING"
    },

    addressId: { type: Schema.Types.ObjectId, ref: "Address" }
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
