import { GAME_EXECUTABLE_PATH } from "#src/services/genshinParity/constants";
import { spawn } from "node:child_process";

// The game asks for elevation on every start, so it is started through the shell's elevation prompt, which the user
// Answers; the tool returns at once and never waits on the game
export const launchGame = (): void => {
  spawn("powershell", ["-NoProfile", "-Command", `Start-Process -FilePath '${GAME_EXECUTABLE_PATH}' -Verb RunAs`], {
    detached: true,
    stdio: "ignore",
  }).unref();
  console.log(`started ${GAME_EXECUTABLE_PATH}`);
};
