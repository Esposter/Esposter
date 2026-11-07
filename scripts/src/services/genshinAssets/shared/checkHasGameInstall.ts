import { GAME_EXECUTABLE_PATH } from "#src/services/genshinParity/shared/constants";
import { existsSync } from "node:fs";

// Whether this machine has the game installed, which is what gives it a game version a stamp can be held to
export const checkHasGameInstall = (): boolean => existsSync(GAME_EXECUTABLE_PATH);
