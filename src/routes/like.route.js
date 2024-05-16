import express from "express";
import { removeAllLikesByPinId, toggleLike } from "../controllers/like.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
const router = express.Router();

router.route("/:id/toggle-pin-like").post(verifyJWT, toggleLike);
router.route("/remove-pin-likes").post(verifyJWT, removeAllLikesByPinId);

export default router;
