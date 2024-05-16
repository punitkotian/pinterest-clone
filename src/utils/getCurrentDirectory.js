import { fileURLToPath } from "url";
import path from "path";

function getCurrentDirectory() {
  const currentModuleUrl = new URL(import.meta.url);
  const currDirectory = path.dirname(fileURLToPath(currentModuleUrl));
  return currDirectory;
}

export { getCurrentDirectory };
