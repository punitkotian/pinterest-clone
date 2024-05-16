import { Comment } from "../models/comment.model.js";
import { Pin } from "../models/pin.model.js";
import { validateFields } from "../utils/validation.js";

const createPinComment = async (req, res) => {
  try {
    const { comment_text } = req.body;
    const pin_id = req.params?.pin_id;
    const user_id = res.locals.user?._id;

    if (validateFields(pin_id, comment_text)) {
      throw new Error("pin id and comment text are required");
    }

    const newComment = await Comment.create({
      pin_id: pin_id,
      creator: user_id,
      comment_text: comment_text,
    });

    const updatedPin = await Pin.findByIdAndUpdate(
      pin_id,
      {
        $push: { comments: newComment._id },
      },
      { new: true }
    );

    if (!updatedPin) {
      throw new Error("Pin not found");
    }

    return res.redirect("back");
  } catch (error) {
    console.error("Error while creating comment on pins", error);
    return res.render("pages/error", {
      data: {
        error: error,
        message: "Error while creating comment on pins",
        user: res.locals.user,
      },
    });
  }
};

export { createPinComment };
