import { promises as fsPromises, constants } from "fs";
import path from "path";
import { getCurrentDirectory } from "./getCurrentDirectory.js";

const currDirectory = getCurrentDirectory();

const { access, unlink } = fsPromises;

export async function deleteFile(filename) {
  try {
    const filePath = path.join(
      currDirectory,
      "..",
      "..",
      "public/uploads",
      filename
    );

    await access(filePath, constants.F_OK);
    await unlink(filePath);
  } catch (err) {
    if (err.code === "ENOENT") {
      console.error("File does not exist:", err);
    } else {
      console.error("Error deleting file:", err);
    }
  }
}
