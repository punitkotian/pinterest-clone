import mongoose from "mongoose";
import { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {
  SALT_ROUNDS,
  ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_SECRET,
} from "../config.js";

const userSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
    },
    userpins: [
      {
        type: mongoose.Types.ObjectId,
        ref: "UserPin",
      },
    ],
    refreshTokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true, collation: { locale: "en", strength: 2 } }
);

userSchema.pre("save", async function (next) {
  try {
    if (this.isModified("password")) {
      this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
    }
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.isPasswordCorrect = function (password) {
  try {
    return bcrypt.compareSync(password, this.password);
  } catch (error) {
    throw error;
  }
};

userSchema.methods.generateAccessToken = async function () {
  try {
    const token = jwt.sign({ _id: this._id }, ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });

    return token;
  } catch (error) {
    throw error;
  }
};

userSchema.methods.generateRefreshToken = async function () {
  try {
    const token = jwt.sign({ _id: this._id }, REFRESH_TOKEN_SECRET);

    this.refreshTokens = this.refreshTokens.concat({ token: token });
    await this.save();

    return token;
  } catch (error) {
    throw error;
  }
};

export const User = mongoose.model("User", userSchema);
