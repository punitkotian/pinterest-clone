import express from "express";
import {
  createBoard,
  createBoardGet,
  deleteBoard,
  getBoardDetails,
  getBoards,
  getPinsByBoardId,
  updateBoard,
} from "../controllers/board.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
const router = express.Router();

router
  .route("/create-board")
  .get(verifyJWT, createBoardGet)
  .post(verifyJWT, createBoard);
router.route("/board/:id").get(verifyJWT, getBoardDetails);
// updated
// router.route("/:username/board_pins/:id").get(verifyJWT, getPinsByBoardId);
router.route("/:username/:title").get(verifyJWT, getPinsByBoardId);
router.route("/update-board/:id").put(verifyJWT, updateBoard);
router.route("/delete-board/:id").delete(verifyJWT, deleteBoard);
router.route("/boards").get(verifyJWT, getBoards);

export default router;
