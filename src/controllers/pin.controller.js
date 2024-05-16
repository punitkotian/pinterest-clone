import { UserPin } from "../models/userPin.model.js";
import { Pin } from "../models/pin.model.js";
import { User } from "../models/user.model.js";
import { generateObjectIdFromHexString } from "../utils/convert.js";
import { validateFields } from "../utils/validation.js";
import { Comment } from "../models/comment.model.js";
import { Like } from "../models/like.model.js";

import { Board } from "../models/board.model.js";
import { deleteFile } from "../utils/deleteFile.js";

const createPin = async (req, res) => {
  try {
    const { title = "", description = "" } = req.body;
    const user_id = res.locals.user?._id;
    const pinImage = req.file.filename;

    const user = await User.findById(user_id);

    if (!user) {
      throw new Error("user not found");
    }

    if (validateFields(pinImage)) {
      return res.render("pages/create-pin", {
        message: "Image is required.",
      });
    }

    const pin = await Pin.create({
      image: pinImage,
      title: title,
      creator: user_id,
      description: description,
    });

    const userPin = await UserPin.create({
      pin_id: pin._id,
      user_id: user_id,
      pin_type: "created",
    });

    user.userpins.push(userPin._id);
    await user.save();

    return res.render("pages/create-pin", {
      message: "Your pin has been published",
      data: {
        user: res.locals.user,
      },
    });
  } catch (error) {
    console.error("Error while creating pin", error);
    return res.render("pages/error", {
      data: {
        error: error,
        message: "Error while creating pin",
        user: res.locals.user,
      },
    });
  }
};

const savePin = async (req, res) => {
  try {
    const pin_id = req.params?.id;

    const user_id = res.locals?.user?._id;
    const user = await User.findById(user_id);

    const pin = await Pin.findOne({
      _id: pin_id,
    });

    if (!pin) {
      throw new Error("Pin has been recently deleted.");
    }

    const userPin = await UserPin.create({
      pin_id: pin_id,
      user_id: user_id,
      pin_type: "saved",
    });

    user.userpins.push(userPin._id);
    await user.save();

    return res.redirect("back");
  } catch (error) {
    console.error("Error while saving pin", error);
    res.render("pages/error", {
      data: {
        error: error,
        message: "Error while saving pin",
        user: res.locals.user,
      },
    });
  }
};

const getSavedPins = async (user_id, limit) => {
  return await getUserPinsByPinType(user_id, "saved", limit);
};

const getCreatedPins = async (user_id, limit) => {
  return await getUserPinsByPinType(user_id, "created", limit);
};

const getUserPins = async (user_id, limit) => {
  try {
    const data = await User.aggregate([
      {
        $match: {
          _id: user_id,
        },
      },
      {
        $lookup: {
          from: "userpins",
          localField: "userpins",
          foreignField: "_id",
          as: "userpins",
          pipeline: [
            {
              $sort: {
                createdAt: -1,
              },
            },
            {
              $lookup: {
                from: "pins",
                localField: "pin_id",
                foreignField: "_id",
                as: "pin",
                pipeline: [
                  {
                    $lookup: {
                      from: "users",
                      localField: "creator",
                      foreignField: "_id",
                      as: "creator",
                      pipeline: [
                        {
                          $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1,
                          },
                        },
                      ],
                    },
                  },
                  {
                    $addFields: {
                      creator: { $arrayElemAt: ["$creator", 0] },
                    },
                  },
                ],
              },
            },
            {
              $addFields: {
                pin: { $arrayElemAt: ["$pin", 0] },
              },
            },
          ],
        },
      },

      {
        $addFields: {
          totalPins: { $size: "$userpins" },
        },
      },
      {
        $project: {
          _id: 1,
          username: 1,
          fullName: 1,
          avatar: 1,
          totalPins: 1,
          userpins: "$userpins",
        },
      },
    ]);
    console.log;
    return data;
  } catch (error) {
    console.error("Error while fetching user pins", error);
  }
};

const getUserPinsByPinType = async (user_id, pin_type, limit) => {
  try {
    const data = await User.aggregate([
      {
        $match: {
          _id: user_id,
        },
      },
      {
        $lookup: {
          from: "userpins",
          localField: "userpins",
          foreignField: "_id",
          as: "userpins",
          pipeline: [
            {
              $match: {
                pin_type: pin_type,
              },
            },
            {
              $sort: {
                createdAt: -1,
              },
            },
            {
              $lookup: {
                from: "pins",
                localField: "pin_id",
                foreignField: "_id",
                as: "pin",
                pipeline: [
                  {
                    $lookup: {
                      from: "users",
                      localField: "creator",
                      foreignField: "_id",
                      as: "creator",
                      pipeline: [
                        {
                          $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1,
                          },
                        },
                      ],
                    },
                  },
                  {
                    $addFields: {
                      creator: { $arrayElemAt: ["$creator", 0] },
                    },
                  },
                ],
              },
            },
            {
              $addFields: {
                pin: { $arrayElemAt: ["$pin", 0] },
              },
            },
          ],
        },
      },
      {
        $project: {
          _id: 1,
          username: 1,
          fullName: 1,
          avatar: 1,
          totalPins: { $size: "$userpins" },
          userpins: "$userpins",
        },
      },
    ]);

    return data;
  } catch (error) {
    console.error("Error while fetching user pins", error);
  }
};

const getAllPins = async () => {
  try {
    const pins = await Pin.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "creator",
          foreignField: "_id",
          as: "creator",
          pipeline: [
            {
              $project: {
                _id: 1,
                username: 1,
                avatar: 1,
                fullName: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          creator: { $arrayElemAt: ["$creator", 0] },
        },
      },
      {
        $sort: {
          createdAt: -1, // Sort by creation time in descending order
        },
      },
      // {
      //   $limit: 10,
      // },
    ]);
    return pins;
  } catch (error) {
    console.error("Error while fetching pins", error);
  }
};

const deleteSavedPin = async (req, res) => {
  try {
    // remove req?.body?.user_id
    const user_id = res.locals?.user?._id;
    const userpin_id = req.params?.id;

    if (validateFields(userpin_id)) {
      return res.status(400).json({
        message: "Pin id is missing",
      });
    }

    const userPin = await UserPin.findOneAndDelete({
      _id: userpin_id,
      user_id: user_id,
    });

    if (!userPin) {
      return res.status(401).json({
        message: "Unauthorized access",
      });
    }

    const board = await Board.findOneAndUpdate(
      { creator: user_id },
      { $pull: { userpins: generateObjectIdFromHexString(userpin_id) } },
      { new: true }
    );

    const user = await User.findByIdAndUpdate(
      {
        _id: user_id,
      },
      {
        $pull: {
          userpins: generateObjectIdFromHexString(userpin_id),
        },
      },
      { new: true }
    );

    return res.status(200).json({ message: "Pin deleted" });
  } catch (error) {
    console.error("Error while updating pin", error);
    return res
      .status(500)
      .json({ message: "Something went wrong.", error, user: res.locals.user });
  }
};

const deleteCreatedPin = async (req, res) => {
  try {
    const user = res.locals.user;
    const userpin_id = req.params?.id;

    if (validateFields(userpin_id)) {
      return res.status(400).json({
        message: "Pin id is missing",
      });
    }

    const boardModel = await Board.findOneAndUpdate(
      {
        creator: user?._id,
      },
      {
        $pull: {
          userpins: userpin_id,
        },
      },
      { new: true }
    );

    const userPin = await UserPin.findOneAndDelete({
      _id: userpin_id,
      user_id: user?._id,
    });

    const pin_id = userPin.pin_id;

    if (user.userpins.includes(userPin._id)) {
      user.userpins.pull(userPin._id);
      await user.save();
    }
    //
    const pin = await Pin.findOneAndDelete({
      _id: pin_id,
      creator: user?._id,
    });

    if (!pin) {
      return res.status(404).json({
        message: "Unauthorized access",
      });
    }

    await deleteFile(pin?.image);

    // delete all comments
    await Comment.deleteMany({
      pin_id: pin_id,
    }); // delete all likes
    await Like.deleteMany({
      pin_id: pin_id,
    });

    res.status(200).json({ message: "Pin deleted" });
  } catch (error) {
    console.error("Error while updating pin", error);
    return res
      .status(500)
      .json({ message: "Something went wrong.", error, user: res.locals.user });
  }
};

const editCreatedPinPost = async (req, res) => {
  try {
    const user = res.locals?.user;
    const _id = req.params?.id;
    const { title = "", description = "", board } = req.body;

    if (!_id) {
      return res.status(400).json({ message: "Pin id is missing" });
    }

    const isBoard = await Board.findOne({ creator: user._id, title: board });

    const userPin = await UserPin.findOne({
      _id,
      user_id: user?._id,
    });

    if (!userPin) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    if (isBoard) {
      if (!userPin?.board?.equals(isBoard._id)) {
        const prevBoard = await Board.findOneAndUpdate(
          { _id: userPin.board },
          { $pull: { userpins: userPin._id } },
          { new: true }
        );
      }
      if (!isBoard.userpins.includes(userPin._id)) {
        isBoard.userpins.push(userPin._id);
        await isBoard.save();
      }
      (userPin.board = isBoard?._id), await userPin.save();
    }

    const pin = await Pin.findOneAndUpdate(
      {
        _id: userPin?.pin_id,
        creator: user?._id,
      },
      {
        title,
        description,
      },
      { new: true }
    );

    if (!pin) {
      return res.status(401).json({ message: "Unauthorized access" });
    }
    return res.status(200).json({ message: "Pin updated" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Something went wrong.", error, user: res.locals.user });
  }
};

const editSavedPinPost = async (req, res) => {
  try {
    const user = res.locals?.user;
    const _id = req.params?.id;
    const { board } = req.body;

    if (!_id) {
      return res.status(400).json({ message: "Pin id is missing" });
    }
    const isBoard = await Board.findOne({ creator: user._id, title: board });
    if (!isBoard) {
      return res.status(400).json({ message: "Please select board" });
    }

    const userPin = await UserPin.findOne({
      _id,
      user_id: user?._id,
    });

    if (isBoard) {
      if (!userPin?.board?.equals(isBoard._id)) {
        const prevBoard = await Board.findOneAndUpdate(
          { _id: userPin.board },
          { $pull: { userpins: userPin._id } },
          { new: true }
        );
      }
      if (!isBoard.userpins.includes(userPin._id)) {
        isBoard.userpins.push(userPin._id);
        await isBoard.save();
      }
      userPin.board = isBoard?._id;
      await userPin.save();
    }
    return res.status(200).json({ message: "Pin updated" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Something went wrong.", error, user: res.locals.user });
  }
};

// render
const pins = async (req, res) => {
  const pins = await getAllPins(10);

  res.render("pages/feed", { data: { pins, user: res.locals.user } });
};

const allPins = async (req, res) => {
  const username = req.params?.username || res.locals.user.username;
  const user = await User.findOne(
    { username: username },
    { password: 0, refreshTokens: 0 }
  );
  if (!user) {
    res.redirect("/");
  }
  const all_pins_data = await getUserPins(user._id);

  const userpins = all_pins_data?.[0]?.userpins;

  const isCurrentUser = user._id.equals(res.locals.user?._id);
  const otherUser = isCurrentUser ? undefined : user;

  res.render("pages/user-pins", {
    data: {
      heading: "All Pins",
      userpins,
      isCurrentUser,
      user: res.locals.user,
      otherUser,
    },
  });
};

const createdPins = async (req, res) => {
  const username = req.params?.username || res.locals.user.username;
  const user = await User.findOne(
    { username: username },
    { password: 0, refreshTokens: 0 }
  );

  if (!user) {
    res.redirect("/");
  }

  const created_pins_data = await getCreatedPins(user._id, 6);
  const userpins = created_pins_data?.[0]?.userpins;

  const isCurrentUser = user._id.equals(res.locals.user?._id);
  const otherUser = isCurrentUser ? undefined : user;

  res.render("pages/user-pins", {
    data: {
      heading: "Created Pins",
      userpins,
      isCurrentUser,
      user: res.locals.user,
      otherUser,
    },
  });
};

const savedPins = async (req, res) => {
  const username = req.params?.username || res.locals.user.username;
  const user = await User.findOne(
    { username: username },
    { password: 0, refreshTokens: 0 }
  );

  if (!user) {
    res.redirect("/");
  }

  const saved_pins_data = await getSavedPins(user._id, 6);
  const userpins = saved_pins_data?.[0]?.userpins;

  const isCurrentUser = user._id.equals(res.locals.user?._id);
  const otherUser = isCurrentUser ? undefined : user;

  res.render("pages/user-pins", {
    data: {
      heading: "Saved Pins",
      userpins,
      isCurrentUser,
      user: res.locals.user,
      otherUser,
    },
  });
};

const editPin = async (req, res) => {
  try {
    const user = res.locals.user;
    const _id = req.params?.id;

    const userpinData = await UserPin.aggregate([
      {
        $match: { _id: generateObjectIdFromHexString(_id), user_id: user?._id },
      },
      {
        $lookup: {
          from: "pins",
          localField: "pin_id",
          foreignField: "_id",
          as: "pin",
        },
      },
      {
        $addFields: {
          pin: { $arrayElemAt: ["$pin", 0] }, // Extract the first element of the 'pin' array
        },
      },
    ]);

    const { pin_type } = userpinData[0] || {};

    if (pin_type === "created") {
      return res.render("pages/edit-created-pin", {
        data: { ...userpinData[0], user },
      });
    } else if (pin_type === "saved") {
      return res.render("pages/edit-saved-pin", {
        data: { ...userpinData[0], user },
      });
    }

    return res.redirect("back");
  } catch (error) {
    console.error("Error in editPin:", error);
    return res.render({
      data: { message: "Failed to update pin.", error, user: res.locals.user },
    });
  }
};

const getPinByPinId = async (req, res) => {
  try {
    const pin_id = req.params?.id;
    const user = res.locals.user;

    const pin = await Pin.aggregate([
      {
        $match: {
          _id: generateObjectIdFromHexString(pin_id),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "creator",
          foreignField: "_id",
          as: "creator",
          pipeline: [
            {
              $project: {
                _id: 1,
                username: 1,
                fullName: 1,
                email: 1,
                avatar: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "comments",
          foreignField: "_id",
          as: "comments",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "creator",
                foreignField: "_id",
                as: "creator",
                pipeline: [
                  {
                    $project: {
                      _id: 1,
                      username: 1,
                      email: 1,
                      fullName: 1,
                      avatar: 1,
                    },
                  },
                ],
              },
            },
            {
              $addFields: {
                creator: { $arrayElemAt: ["$creator", 0] },
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "likes",
          localField: "likes",
          foreignField: "_id",
          as: "likes",
        },
      },
      {
        $addFields: {
          commentsCount: {
            $size: "$comments",
          },
          likesCount: {
            $size: "$likes", // check
          },
          isLiked: {
            $cond: {
              if: {
                $in: [user?._id, "$likes.creator"],
              },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          image: 1,
          title: 1,
          description: 1,
          creator: { $arrayElemAt: ["$creator", 0] },
          comments: 1,
          commentsCount: 1,
          likesCount: 1,
          isLiked: 1,
        },
      },
    ]);

    if (!pin?.[0]) {
      return res.redirect("back");
    }

    return res.render("pages/pindetails", {
      data: {
        user: {
          username: user.username,
          fullName: user.fullName,
          avatar: user?.avatar,
        },
        pin: pin?.[0],
      },
    });
  } catch (error) {
    console.error("Error while fetching pin", error);
    return res.render({
      data: { message: "Failed to fetch pin.", error, user: res.locals.user },
    });
  }
};

export {
  createPin,
  savePin,
  deleteSavedPin,
  deleteCreatedPin,
  getPinByPinId,
  savedPins,
  createdPins,
  allPins,
  pins,
  editPin,
  editCreatedPinPost,
  editSavedPinPost,
  getCreatedPins,
  getSavedPins,
  getUserPins,
};
