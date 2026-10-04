import { GAME_EXECUTABLE_NAME } from "#src/services/genshinParity/shared/constants";
import { execFileSync } from "node:child_process";

// Whether the game is running now, by Windows' own list of processes under its executable's name
export const checkIsGameRunning = (): boolean =>
  execFileSync("tasklist", ["/FI", `IMAGENAME eq ${GAME_EXECUTABLE_NAME}`, "/NH"], { encoding: "utf8" }).includes(
    GAME_EXECUTABLE_NAME,
  );
