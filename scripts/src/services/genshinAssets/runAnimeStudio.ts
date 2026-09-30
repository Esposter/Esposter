import { ANIMESTUDIO_CLI_PATH } from "#src/services/genshinAssets/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname } from "node:path";

// Runs AnimeStudio's command line for the game, from its own folder since it keeps its CAB map beside its working
// Directory, blocking and quiet but for warnings and errors. It reads the game's files alone and sends the game
// Nothing, so the game is kept closed while it runs
export const runAnimeStudio = (args: string[]): void => {
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
