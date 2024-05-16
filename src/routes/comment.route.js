import express from "express";
import {
  createPinComment,

} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
const router = express.Router();

router.route("/create-comment/:pin_id").post(verifyJWT, createPinComment);

export default router;
