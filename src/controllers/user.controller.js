import { User } from "../models/user.model.js";
import { REFRESH_TOKEN_SECRET, ACCESS_TOKEN_EXPIRY } from "../config.js";
import jwt from "jsonwebtoken";
import { validateFields } from "../utils/validation.js";
import { getCreatedPins, getSavedPins, getUserPins } from "./pin.controller.js";
import { getBoardsByUserId } from "./board.controller.js";
import { deleteFile } from "../utils/deleteFile.js";
import { createAvatar } from "../utils/createAvatar.js";

const options = {
  httpOnly: true,
  secure: true,
  sameSite: "Strict",
};

const registerUser = async (req, res) => {
  try {
    const { username, email, fullName, password } = req.body;

    if (validateFields(username, email, fullName, password)) {
      return res.render("pages/register", {
        message: "All fields are required.",
      });
    }

    const isUserExist = await User.findOne({ $or: [{ username }, { email }] });

    if (isUserExist) {
      return res.render("pages/register", {
        message: "User with email or username already exists",
      });
    }

    const avatarText = fullName[0].toUpperCase();
    const avatar = await createAvatar(avatarText);

    const user = await User.create({
      username: username,
      email: email,
      fullName: fullName,
      password: password,
      avatar: avatar || "",
    });

    const createdUser = await User.findById(user._id).select(
      "-password -refreshTokens"
    );

    if (!createdUser) {
      return res.render("pages/error", {
        message: "Something went wrong while registering the user.",
      });
    }

    // TODO: show profile page
    return res.redirect("/login");
  } catch (error) {
    console.error("Error while registering user", error);
    return res.render("pages/error", {
      data: {
        error: error,
        message: "Something went wrong while registering the user.",
      },
    });
  }
};

const LoginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (validateFields(username, password)) {
      return res.render("pages/login", { message: "All fields are required" });
    }

    const user = await User.findOne({ username });

    if (!user || !user.isPasswordCorrect(password)) {
      return res.render("pages/login", {
        message: "Invalid username or password",
      });
    }

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshTokens"
    );

    res
      .cookie("accessToken", accessToken, {
        ...options,
        maxAge: ACCESS_TOKEN_EXPIRY,
      })
      .cookie("refreshToken", refreshToken, options);

    return res.redirect("/profile_pins");
  } catch (error) {
    console.error("Error while logging user", error);
    return res.render("pages/error", {
      data: { error: error, message: "Internal Server Error" },
    });
  }
};

const LogoutUser = async (req, res) => {
  try {
    const userId = res.locals.user?._id;

    if (!userId) {
      return res.render("pages/error", {
        message: "Unauthorized Access",
      });
    }

    const user = await User.findOne({ _id: userId });

    if (user && user.refreshTokens) {
      user.refreshTokens = user.refreshTokens.filter((tokenObj) => {
        return tokenObj.refreshToken !== req?.cookie?.refreshToken;
      });
      await user.save();
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.redirect("/login");
  } catch (error) {
    console.error("Error during logout:", error);
    return res.render("pages/error", {
      data: { error: error, message: "Internal Server Error" },
    });
  }
};

const ProfilePins = async (req, res) => {
  try {
    const username = req?.params?.username || res.locals.user.username;
    const user = await User.findOne(
      { username: username },
      { password: 0, refreshTokens: 0 }
    );

    if (!user) {
      return res.redirect("/");
    }

    const all_pins_data = await getUserPins(user._id, 6);
    const created_pins_data = await getCreatedPins(user._id, 6);
    const saved_pins_data = await getSavedPins(user._id, 6);

    const all_pins = {
      userpins: all_pins_data?.[0]?.userpins,
      totalPins: all_pins_data?.[0]?.totalPins,
    };
    const created_pins = {
      userpins: created_pins_data?.[0]?.userpins,
      totalPins: created_pins_data?.[0]?.totalPins,
    };
    const saved_pins = {
      userpins: saved_pins_data?.[0]?.userpins,
      totalPins: saved_pins_data?.[0]?.totalPins,
    };

    const isCurrentUser = user._id.equals(res.locals.user?._id);
    const otherUser = isCurrentUser ? undefined : user;

    return res.render("pages/profile-pins", {
      data: {
        user: res.locals.user,
        all_pins,
        created_pins,
        saved_pins,
        isCurrentUser,
        otherUser,
      },
    });
  } catch (error) {
    // Handle errors
    console.error("Error in ProfilePins:", error);
    return res.render("pages/error", {
      data: {
        error: error,
        message: "Failed to fetch Pins",
        user: res.locals.user,
      },
    });
  }
};

const ProfileBoards = async (req, res) => {
  try {
    const username = req.params?.username || res.locals.user.username;
    const user = await User.findOne(
      { username: username },
      { password: 0, refreshTokens: 0 }
    );

    if (!user) {
      return res.redirect("/");
    }

    const boards = await getBoardsByUserId(user._id, 4);

    const isCurrentUser = user._id.equals(res.locals.user?._id);
    const otherUser = isCurrentUser ? undefined : user;

    return res.render("pages/profile-boards", {
      data: { user: res.locals.user, boards, isCurrentUser, otherUser },
    });
  } catch (error) {
    console.error("Error in ProfileBoards:", error);
    return res.render("pages/error", {
      data: {
        error: error,
        message: "Failed to fetch Boards",
        user: res.locals.user,
      },
    });
  }
};

const editProfile = async (req, res) => {
  try {
    const user = res.locals.user;
    return res.render("pages/edit-profile", {
      data: {
        user,
      },
    });
  } catch (error) {
    console.error("Error in EditProfile:", error);
    return res.render("pages/error", {
      data: {
        error: error,
        message: "Failed to update profile",
        user: res.locals.user,
      },
    });
  }
};

const editProfilePic = async (req, res) => {
  try {
    const user = res.locals.user;
    const avatar = req.file.filename;

    if (!avatar) {
      res.redirect("back");
    }

    if (user?.avatar) {
      await deleteFile(user.avatar);
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: user?._id },
      {
        avatar,
      }
    );

    res.redirect("back");
  } catch (error) {
    console.error("Error in EditProfilePic:", error);
    res.redirect("back");
  }
};

const editProfilePost = async (req, res) => {
  const user = res.locals.user;
  try {
    const { username, fullName } = req.body;

    if (validateFields(username, fullName)) {
      return res.render("pages/edit-profile", {
        data: {
          message: "All Fields are required",
          user,
        },
      });
    }

    const isUserExist = await User.findOne({
      username,
      _id: { $ne: user._id },
    });

    if (isUserExist) {
      return res.render("pages/edit-profile", {
        data: {
          message: "Username is already taken",
          user: {
            username: user.username,
            fullName: user.fullName,
            avatar: user.avatar,
          },
        },
      });
    }

    const updateUser = await User.findOneAndUpdate(
      {
        _id: user._id,
      },
      {
        username,
        fullName,
      },
      {
        new: true,
      }
    );

    return res.render("pages/edit-profile", {
      data: {
        message: "Profile updated",
        user: {
          username: updateUser.username,
          fullName: updateUser.fullName,
          avatar: updateUser.avatar,
        },
      },
    });
  } catch (error) {
    console.error("Error in EditProfile:", error);
    return res.render("pages/edit-profile", {
      data: {
        message: "Something went wrong",
        user: res.locals.user,
      },
    });
  }
};

const renewAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return false;
    }
    const decodedToken = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

    const user = await User.findOne({ _id: decodedToken._id }).select(
      "-password -refreshTokens"
    );

    if (!user) {
      return false;
    }

    const newAccessToken = await user.generateAccessToken();
    res.cookie("accessToken", newAccessToken, {
      ...options,
      maxAge: ACCESS_TOKEN_EXPIRY,
    });

    req.user = user;

    return true;
  } catch (error) {
    return false;
  }
};

export {
  registerUser,
  LoginUser,
  LogoutUser,
  renewAccessToken,
  editProfile,
  editProfilePost,
  editProfilePic,
  ProfilePins,
  ProfileBoards,
};
