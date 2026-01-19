import mongoose from "mongoose";
const { Schema } = mongoose;

const addressSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    fullName: { type: String, required: true },
    mobileNo: { type: String, required: true },

    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },

    type: {
      type: String,
      enum: ["HOME", "WORK"],
      default: "HOME",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Address", addressSchema);
