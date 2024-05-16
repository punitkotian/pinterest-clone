import mongoose from "mongoose";
import { Schema } from "mongoose";

const boardSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    userpins: [
      {
        type: Schema.Types.ObjectId,
        ref: "UserPin",
      },
    ],
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true, }
);

boardSchema.index(
  { title: 1, creator: 1 },
  { unique: true }
);

export const Board = mongoose.model("Board", boardSchema);
