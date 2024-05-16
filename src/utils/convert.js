import mongoose from "mongoose";

const generateObjectIdFromHexString = (hexString) => {
  const id = mongoose.Types.ObjectId.createFromHexString(hexString);
  return id;
};

export { generateObjectIdFromHexString };
