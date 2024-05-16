import { createCanvas } from "canvas";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { getCurrentDirectory } from "./getCurrentDirectory.js";

const currentDirectory = getCurrentDirectory();
const imagePath = path.join(currentDirectory, "..", "..", "public", "uploads");

const colors = [
  "#008DDA",
  "#D83F31",
  "#FB6D48",
  "#F2613F",
  "#E8751A",
  "#86469C",
  "#009578",
  "#FF9800",
  "#A79277",
  "#D74B76",
  "#8B93FF",
  "#FFAF45",
  "#E9B824",
];

function generateRandomColor(colors) {
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
}
const foregroundColor = "white";
const backgroundColor = generateRandomColor(colors);

async function createAvatar(text) {
  try {
    const canvas = createCanvas(200, 200);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = "bold 100px Arial";
    ctx.fillStyle = foregroundColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const buffer = canvas.toBuffer("image/jpeg");

    const uniqueFilename = `${uuidv4()}.jpg`;

    const imageFilePath = path.join(imagePath, `${uniqueFilename}`);
    await fs.writeFile(imageFilePath, buffer);

    return uniqueFilename;
  } catch (error) {
    console.error("Error creating avatar:", error);
    throw error;
  }
}

export { createAvatar };
