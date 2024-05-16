import cookieParser from "cookie-parser";
import express, { urlencoded } from "express";
import path from "path";
import userRouter from "./routes/user.routes.js";
import pinRouter from "./routes/pin.route.js";
import likeRouter from "./routes/like.route.js";
import commetRouter from "./routes/comment.route.js";
import boardRouter from "./routes/board.route.js";
import { getCurrentDirectory } from "./utils/getCurrentDirectory.js";

const app = express();

const currDirectory = getCurrentDirectory();

app.set("views", path.join(currDirectory, "..", "..", "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(currDirectory, "..", "..", "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(userRouter);
app.use(pinRouter);
app.use(likeRouter);
app.use(commetRouter);
app.use(boardRouter);

const isStaticAsset = (req, res, next) => {
  const staticAssetPaths = [
    "/css",
    "/js",
    "/images",
    "/uploads",
    "/favicon.ico",
  ];

  const requestedPath = req.path;
  const isStatic = staticAssetPaths.some((staticPath) =>
    requestedPath.startsWith(staticPath)
  );

  if (isStatic) {
    next();
  } else {
    res.redirect("/");
  }
};

app.use(isStaticAsset);

export { app };
