import { ACCESS_TOKEN_SECRET } from "../config.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { renewAccessToken } from "../controllers/user.controller.js";

const verifyJWT = async (req, res, next) => {
  try {
    const accessToken =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!accessToken) {
      if (await renewAccessToken(req, res)) {
        return next();
      }

      return res.redirect("/login");
    }

    const decodedToken = jwt.verify(accessToken, ACCESS_TOKEN_SECRET);

    const user = await User.findOne({ _id: decodedToken?._id }).select(
      "-password -refreshTokens"
    );

    if (!user) {
      return res.redirect("/login")
    }

    res.locals.user = user;

    
    next();
  } catch (error) {
    console.error("Token verification failed", error);
    return res.render("pages/error", { error: error, message: "Unauthorized - Invalid token" });
  }
};



export { verifyJWT };
