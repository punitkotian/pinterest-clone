import express from "express";
import {
  allPins,
  createPin,
  createdPins,
  deleteCreatedPin,
  deleteSavedPin,
  editCreatedPinPost,
  editPin,
  editSavedPinPost,
  getPinByPinId,
  savePin,
  savedPins,
} from "../controllers/pin.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

router
  .route("/create-pin")
  .get(verifyJWT, (req, res, next) => {
    res.render("pages/create-pin", { data: { user: res.locals.user } });
  })
  .post(verifyJWT, upload.single("pinImage"), createPin);

router.route("/pin/:id").get(verifyJWT, getPinByPinId);
router.route("/save-pin/:id").get(verifyJWT, savePin);
router.route("/delete-saved-pin/:id").delete(verifyJWT, deleteSavedPin);
router.route("/delete-created-pin/:id").delete(verifyJWT, deleteCreatedPin);

router.route("/:username/all-pins").get(verifyJWT, allPins);
router.route("/:username/saved-pins").get(verifyJWT, savedPins);
router.route("/:username/created-pins").get(verifyJWT, createdPins);

router.route("/edit-pin/:id").get(verifyJWT, editPin);
router.route("/edit-created-pin/:id").post(verifyJWT, editCreatedPinPost);
router.route("/edit-saved-pin/:id").post(verifyJWT, editSavedPinPost);

export default router;
