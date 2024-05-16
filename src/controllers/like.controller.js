import { Like } from "../models/like.model.js";
import { Pin } from "../models/pin.model.js";
import { validateFields } from "../utils/validation.js";

const toggleLike = async (req, res) => {
  try {
    const user_id = res.locals?.user._id;
    const pin_id = req.params.id;

    if (!pin_id) {
      return res.status(400).json({
        message: "Pin id is required",
      });
    }

    const existingLike = await Like.findOne({ pin_id, creator: user_id });
    // const pin = await Like.findOne({pin_id})

    if (existingLike) {
      await Like.deleteOne({ pin_id, creator: user_id }, { new: true });
      await Pin.findOneAndUpdate(
        {
          _id: pin_id,
        },
        {
          $pull: {
            likes: existingLike._id,
          },
        }
      );
      return res.json({
        status: "success",
        message: "Like removed successfully",
      });
    } else {
      const newLike = await Like.create({
        creator: user_id,
        pin_id,
      });

      await Pin.findOneAndUpdate(
        {
          _id: pin_id,
        },
        {
          $push: {
            likes: newLike._id,
          },
        }
      );
      return res.json({
        status: "success",
        message: "Like created successfully",
        data: newLike,
      });
    }
  } catch (error) {
    console.error("Error while toggling like on pins", error);
    return res
      .status(500)
      .json({ status: "error", error: "Failed to toggle like." });
  }
};

const removeAllLikesByPinId = async (req, res) => {
  try {
    const { pin_id } = req.body;

    if (validateFields(pin_id)) {
      return res.status(400).json({
        status: "error",
        error: "Both pin_id and user_id are required",
      });
    }

    const deletionResult = await Like.deleteMany({
      pin_id: pin_id,
    });

    if (deletionResult.deletedCount > 0) {
      return res.status(200).json({
        status: "success",
        message: "All likes removed successfully",
      });
    } else {
      return res.status(404).json({
        status: "error",
        error: "No matching likes found for the provided pin_id and user_id",
      });
    }
  } catch (error) {
    console.error("Error while removing all likes", error);
    return res.status(500).json({
      status: "error",
      error: "Failed to remove all likes.",
    });
  }
};

export { toggleLike, removeAllLikesByPinId };
