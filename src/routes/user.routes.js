import { Router } from "express";
import {
  LoginUser,
  LogoutUser,
  ProfileBoards,
  ProfilePins,
  editProfile,
  editProfilePic,
  editProfilePost,
  registerUser,
  renewAccessToken,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { pins } from "../controllers/pin.controller.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

router
  .route("/register")
  .get((req, res, next) => {
    res.render("pages/register");
  })
  .post(registerUser);

router
  .route("/login")
  .get((req, res, next) => {
    res.render("pages/login");
  })
  .post(LoginUser);

router.route("/edit-profile").post(verifyJWT, editProfilePost);
router
  .route("/edit-profile-pic")
  .post(verifyJWT, upload.single("profileImage"), editProfilePic);

router.route("/logout").get(verifyJWT, LogoutUser);

router.post("/renew-token", renewAccessToken);



router.route("/").get(verifyJWT, pins);
router.route("/:username/profile_pins").get(verifyJWT, ProfilePins);
router.route("/:username/profile_boards").get(verifyJWT, ProfileBoards);
router.route("/edit-profile").get(verifyJWT, editProfile);

export default router;
