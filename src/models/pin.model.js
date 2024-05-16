import mongoose from "mongoose";
import { Schema } from "mongoose";

const pinSchmea = new Schema(
  {
    image: {
      type: String,
      required: true,
    },
    title: {
      type: String,
    }, 
    description: {
      type: String,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment"
      },
    ],
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "Like",
      },
    ],
  },
  { timestamps: true }
);

export const Pin = mongoose.model("Pin", pinSchmea);
