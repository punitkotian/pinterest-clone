import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

const PORT = process.env.PORT || 8000;
const MONGODB_URI = process.env.MONGODB_URI;
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS);
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const ACCESS_TOKEN_EXPIRY = 1000 * 60 * 60 * 24 * 7;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

export {
  PORT,
  MONGODB_URI,
  SALT_ROUNDS,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRY,
};
