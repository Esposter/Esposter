import { GAME_EXECUTABLE_NAME } from "#src/services/genshinParity/shared/constants";
import { execFileSync } from "@esposter/shared-node/child-process";

// Whether the game is running now, by the operating system's own list of processes under its executable's name. Windows
// Lists them with tasklist. macOS has no build of the game, so the game runs under Wine or CrossOver, and its process
// Is listed by ps under the same executable name, read by its path. Any other platform never runs it, so its copied
// Files are always free to read
export const checkIsGameRunning = (platform: NodeJS.Platform = process.platform): boolean => {
  if (platform === "win32")
    return execFileSync("tasklist", ["/FI", `IMAGENAME eq ${GAME_EXECUTABLE_NAME}`, "/NH"], {
      encoding: "utf8",
    }).includes(GAME_EXECUTABLE_NAME);
  if (platform === "darwin")
    return execFileSync("/bin/ps", ["-axo", "comm="], { encoding: "utf8" }).includes(GAME_EXECUTABLE_NAME);
  return false;
};
