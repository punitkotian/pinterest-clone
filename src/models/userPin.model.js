import mongoose from "mongoose";
import { Schema } from "mongoose";

const userPinSchema = new Schema(
  {
    pin_id: {
      type: Schema.Types.ObjectId,
      ref: "Pin",
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    pin_type: {
      type: String,
      enum: ["created", "saved"],
      required: true,
    },
    board: {
      type: Schema.Types.ObjectId,
      ref: "Board",
    },
  },
  { timestamps: true }
);


export const UserPin = mongoose.model("UserPin", userPinSchema)