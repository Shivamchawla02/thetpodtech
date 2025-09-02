import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String }, // ✅ Added phone (optional)
    message: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Contact", contactSchema);
