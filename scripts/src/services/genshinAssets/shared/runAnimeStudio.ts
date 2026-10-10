import { assertAnimeStudioReady } from "#src/services/genshinAssets/shared/assertAnimeStudioReady";
import { ANIMESTUDIO_CLI_PATH } from "#src/services/genshinAssets/shared/constants";
import { getAnimeStudioArgs } from "#src/services/genshinAssets/shared/getAnimeStudioArgs";
import { judgeAnimeStudioRun } from "#src/services/genshinAssets/shared/judgeAnimeStudioRun";
import { spawnSync } from "node:child_process";
import { dirname } from "node:path";

// Runs AnimeStudio's command line for the game, from its own folder since it keeps its CAB map beside its working
// Directory, blocking and quiet but for warnings and errors. It reads the game's files alone and sends the game
// Nothing, and it refuses to start while the game runs, whose files it would be reading under the game's own guard. A
// Run that exits 0 but logged an exception fails too, since AnimeStudio skips what threw and carries on
export const runAnimeStudio = (args: string[]): void => {
  assertAnimeStudioReady();
  const { error, status, stderr, stdout } = spawnSync(ANIMESTUDIO_CLI_PATH, getAnimeStudioArgs(args), {
    cwd: dirname(ANIMESTUDIO_CLI_PATH),
    encoding: "utf8",
    maxBuffer: 1024 ** 3,
  });
  const failure = judgeAnimeStudioRun(
    status,
    `${stdout}\n${stderr}`,
    stderr || stdout || error?.message || `exited with ${status}`,
  );
  if (failure) throw failure;
};
