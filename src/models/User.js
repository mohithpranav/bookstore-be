import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    mobileNo: { type: String },

    addresses: [{ type: Schema.Types.ObjectId, ref: "Address" }],
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
