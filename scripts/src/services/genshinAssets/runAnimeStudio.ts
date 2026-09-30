import { ANIMESTUDIO_CLI_PATH } from "#src/services/genshinAssets/constants";
import { checkIsGameRunning } from "#src/services/genshinParity/checkIsGameRunning";
import { GAME_EXECUTABLE_NAME } from "#src/services/genshinParity/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname } from "node:path";

// Runs AnimeStudio's command line for the game, from its own folder since it keeps its CAB map beside its working
// Directory, blocking and quiet but for warnings and errors. It reads the game's files alone and sends the game
// Nothing, and it refuses to start while the game runs, whose files it would be reading under the game's own guard
export const runAnimeStudio = (args: string[]): void => {
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
  const { error, status, stderr, stdout } = spawnSync(
    ANIMESTUDIO_CLI_PATH,
    [...args, "--game", "GI", "--logger_flags", "Warning", "Error"],
    { cwd: dirname(ANIMESTUDIO_CLI_PATH), encoding: "utf8", maxBuffer: 1024 ** 3 },
  );
  if (status === 0) return;
  throw new InvalidOperationError(
    Operation.Create,
    "AnimeStudio",
    stderr || stdout || error?.message || `exited with ${status}`,
  );
};
