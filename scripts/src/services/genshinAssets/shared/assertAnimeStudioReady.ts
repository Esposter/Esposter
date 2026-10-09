import { ANIMESTUDIO_CLI_PATH } from "#src/services/genshinAssets/shared/constants";
import { checkIsGameRunning } from "#src/services/genshinParity/shared/checkIsGameRunning";
import { GAME_EXECUTABLE_NAME } from "#src/services/genshinParity/shared/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync } from "node:fs";

// Refuses an AnimeStudio run the game's files could not be read by: the game running, or AnimeStudio not unpacked
export const assertAnimeStudioReady = (): void => {
  if (checkIsGameRunning())
    throw new InvalidOperationError(
      Operation.Read,
      GAME_EXECUTABLE_NAME,
      "is running: close the game before AnimeStudio reads its blocks",
    );
  if (!existsSync(ANIMESTUDIO_CLI_PATH))
    throw new InvalidOperationError(
      Operation.Read,
      ANIMESTUDIO_CLI_PATH,
      "not found: unpack AnimeStudio there or name it in GENSHIN_ANIMESTUDIO_CLI",
    );
};
