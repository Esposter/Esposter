import type { AnimeStudioOptions } from "#src/models/recreation/animeStudio/AnimeStudioOptions";

import { getUtilityClampedCommand } from "#src/services/machine/getUtilityClampedCommand";
import { assertAnimeStudioReady } from "#src/services/recreation/animeStudio/assertAnimeStudioReady";
import { getAnimeStudioArgs } from "#src/services/recreation/animeStudio/getAnimeStudioArgs";
import { judgeAnimeStudioRun } from "#src/services/recreation/animeStudio/judgeAnimeStudioRun";
import { spawnSync } from "@esposter/shared-node/child-process";
import { dirname } from "node:path";

// Runs AnimeStudio's command line from its own folder, since it keeps its CAB map beside its working directory, blocking
// And quiet but for warnings and errors. It reads its input alone and sends nothing out, and it refuses to start while
// The guard in its options finds one of its files in use. A run that exits 0 but logged an exception fails too, since
// AnimeStudio skips what threw and carries on.
// On macOS it starts under the utility QoS clamp, so a long sweep of the blocks yields to the user's foreground apps
export const runAnimeStudio = (args: string[], options: AnimeStudioOptions): void => {
  assertAnimeStudioReady(options);
  const { args: spawnArgs, command } = getUtilityClampedCommand(
    options.executablePath,
    getAnimeStudioArgs(args, options.game),
  );
  const { error, status, stderr, stdout } = spawnSync(command, spawnArgs, {
    cwd: dirname(options.executablePath),
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
