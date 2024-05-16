import { Board } from "../models/board.model.js";
import { generateObjectIdFromHexString } from "../utils/convert.js";
import { validateFields } from "../utils/validation.js";
import { User } from "../models/user.model.js";
import { UserPin } from "../models/userPin.model.js";
import { Pin } from "../models/pin.model.js";
import { deleteFile } from "../utils/deleteFile.js";
import { Comment } from "../models/comment.model.js";
import { Like } from "../models/like.model.js";

const createBoard = async (req, res) => {
  try {
    const user_id = res?.locals?.user?._id;
    const { title, description = "" } = req.body;

    if (validateFields(title)) {
      return res.render("pages/create-board", {
        data: {
          message: "Title is required",
          user: res.locals.user,
          success: false,
        },
      });
    }

    if (title === "profile_pins" || title === "profile_boards") {
      return res.render("pages/create-board", {
        data: {
          message: "Sorry, that board name won't work. Please try another!",
          user: res.locals.user,
          success: false,
        },
      });
    }

    const isBoardExist = await Board.findOne({
      title: {
        $regex: new RegExp("^" + title + "$", "i"),
      },
      creator: user_id,
    });

    if (isBoardExist) {
      return res.render("pages/create-board", {
        data: {
          message:
            "Try a different name. You already have a board with this name!",
          user: res.locals.user,
          success: false,
        },
      });
    }

    const newBoard = await Board.create({
      creator: user_id,
      title,
      description,
    });

    return res.render("pages/create-board", {
      data: {
        message: "Board created successfully.",
        user: res.locals.user,
        success: true,
      },
    });
  } catch (error) {
    console.error("Error while creating board.", error);
    return res.render("pages/error", {
      data: {
        error: error,
        message: "Error while creating board.",
        user: res.locals.user,
      },
    });
  }
};

const updateBoard = async (req, res) => {
  try {
    const user_id = req.body?.user_id;
    const board_id = req.params.id;
    const { title, description = "" } = req.body;

    if (!user_id) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    if (validateFields(board_id, title)) {
      return res
        .status(401)
        .json({ message: "Both board_id and title are required" });
    }

    const updatedBoard = await Board.findOneAndUpdate(
      { _id: board_id, creator: user_id },
      { title: title, description: description },
      { new: true, runValidators: true }
    );

    if (!updateBoard) {
      return res
        .status(401)
        .json({ message: "Board not found or user does not have permission" });
    }

    return res.status(200).json({
      message: "Board updated successfully",
      data: updatedBoard,
    });
  } catch (error) {
    console.error("Error while updating board", error);

    return res.status(500).json({
      error: error,
      message: "Error while updating board.",
    });
  }
};

const deleteBoard = async (req, res) => {
  try {
    const user_id = res.locals.user?._id;
    const board_id = req.params?.id;

    if (validateFields(board_id)) {
      return res.status(401).json({ message: "board_id is required" });
    }

    // Find and delete the board
    const deletedBoard = await Board.findOneAndDelete(
      {
        _id: board_id,
        creator: user_id,
      },
      { new: true }
    );

    // Find user pins to delete
    const userPinsToDelete = await UserPin.find({ board: board_id });

    // Delete user pins
    await UserPin.deleteMany({
      user_id: user_id,
      board: board_id,
    });

    const user = await User.findOneAndUpdate(
      {
        _id: user_id,
      },
      {
        $pull: {
          userpins: { $in: userPinsToDelete.map((pin) => pin._id) },
        },
      }
    );

    const pinsToDelete = userPinsToDelete
      .filter((pin) => pin.pin_type === "created")
      .map((pin) => pin.pin_id);

    // delete file
    const pins = await Pin.find({
      creator: user_id,
      _id: { $in: pinsToDelete },
    });

    for (const element of pins) {
      await deleteFile(element?.image);
    }

    await Pin.deleteMany({
      creator: user_id,
      _id: { $in: pinsToDelete },
    });

    await Comment.deleteMany({
      pin_id: { $in: pinsToDelete },
    });
    await Like.deleteMany({
      pin_id: { $in: pinsToDelete },
    });

    if (!deletedBoard) {
      return res.status(401).json({ message: "Board not found" });
    }

    return res.status(200).json({ message: "Board deleted successfully!" });
  } catch (error) {
    console.error("Error while removing board", error);
    return res.status(500).json({
      message: "Error while removing board.",
    });
  }
};

// render
const createBoardGet = async (req, res) => {
  res.render("pages/create-board", { data: { user: res.locals.user } });
};

const getPinsByBoardId = async (req, res) => {
  try {
    const username = req.params?.username || res.locals.user.username;
    const user = await User.findOne(
      { username: username },
      { password: 0, refreshTokens: 0 }
    );

    if (!user) {
      res.redirect("/");
    }
    const board_title = req.params.title;

    if (!board_title) {
      throw new Error("Board title is required");
    }

    const boardData = await Board.aggregate([
      {
        $match: {
          title: board_title,
          creator: user?._id,
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
    ]);

    if (!boardData?.[0]) {
      throw new Error("Board not found");
    }

    const isCurrentUser = user._id.equals(res.locals.user?._id);
    const otherUser = isCurrentUser ? undefined : user;

    const board = boardData?.[0];

    return res.render("pages/user-board-pins", {
      data: {
        heading: board?.title,
        userpins: board?.userpins,
        board_id: board?._id,
        isCurrentUser,
        user: res.locals.user,
        otherUser,
      },
    });
  } catch (error) {
    console.error("Error while fetching Board Pins:", error);
    return res.render("pages/error", {
      data: {
        message:
          error?.message ||
          "An error occurred while fetching the board pins. Please try again later.",
        error,
        user: res.locals.user,
      },
    });
  }
};

const getBoardDetails = async (req, res) => {
  const user = res.locals.user;
  const board_id = req.params.id;
  try {
    if (!board_id) {
      throw new Error("baord id is required");
    }

    const board = await Board.findOne({ _id: board_id, creator: user._id });

    if (!board) {
      throw new Error("board not found");
    }

    return res.json({
      id: board_id,
      title: board.title,
      description: board.description,
    });
  } catch (error) {
    console.error("Error while fetching board.", error);
    return res.status(500).json({
      data: {
        error: error,
        message:
          "An error occurred while fetching the board. Please try again later.",
        user: res.locals.user,
      },
    });
  }
};

const getBoardsByUserId = async (user_id, limit) => {
  try {
    if (!user_id) {
      throw new Error("Unauthorized access");
    }

    const boards = await Board.aggregate([
      {
        $match: {
          creator: user_id,
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
              $lookup: {
                from: "pins",
                localField: "pin_id",
                foreignField: "_id",
                as: "pin",
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
      // {
      //   $addFields: {
      //     userpins: { $slice: ["$userpins", limit] }, // Limit the array to 10 elements
      //   },
      // },
    ]);

    return boards;
  } catch (error) {
    console.error("Error while fetching boards.", error);
    return res.render("pages/error", {
      data: {
        error: error,
        message: "Error while fetching boards.",
        user: res.locals.user,
      },
    });
  }
};

const getBoards = async (req, res) => {
  const user = res.locals?.user;

  const boards = await Board.find({ creator: user?._id }, { title: 1 });

  return res.json({
    boards,
  });
};

export {
  createBoard,
  createBoardGet,
  updateBoard,
  deleteBoard,
  getPinsByBoardId,
  getBoardDetails,
  getBoardsByUserId,
  getBoards,
};
