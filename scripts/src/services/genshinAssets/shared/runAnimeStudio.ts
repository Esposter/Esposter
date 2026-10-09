import { assertAnimeStudioReady } from "#src/services/genshinAssets/shared/assertAnimeStudioReady";
import { ANIMESTUDIO_CLI_PATH } from "#src/services/genshinAssets/shared/constants";
import { getAnimeStudioArgs } from "#src/services/genshinAssets/shared/getAnimeStudioArgs";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { spawnSync } from "node:child_process";
import { dirname } from "node:path";

// Runs AnimeStudio's command line for the game, from its own folder since it keeps its CAB map beside its working
// Directory, blocking and quiet but for warnings and errors. It reads the game's files alone and sends the game
// Nothing, and it refuses to start while the game runs, whose files it would be reading under the game's own guard
export const runAnimeStudio = (args: string[]): void => {
  assertAnimeStudioReady();
  const { error, status, stderr, stdout } = spawnSync(ANIMESTUDIO_CLI_PATH, getAnimeStudioArgs(args), {
    cwd: dirname(ANIMESTUDIO_CLI_PATH),
    encoding: "utf8",
    maxBuffer: 1024 ** 3,
  });
  if (status === 0) return;
  throw new InvalidOperationError(
    Operation.Create,
    "AnimeStudio",
    stderr || stdout || error?.message || `exited with ${status}`,
  );
};
