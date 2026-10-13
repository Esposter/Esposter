import type { AnimeStudioOptions } from "#src/models/recreation/animeStudio/AnimeStudioOptions";

import { getUtilityClampedCommand } from "#src/services/machine/getUtilityClampedCommand";
import { assertAnimeStudioReady } from "#src/services/recreation/animeStudio/assertAnimeStudioReady";
import { getAnimeStudioArgs } from "#src/services/recreation/animeStudio/getAnimeStudioArgs";
import { waitForFreeMemory } from "#src/services/recreation/animeStudio/waitForFreeMemory";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { spawn } from "@esposter/shared-node/child-process";
import { constants, setPriority } from "node:os";
import { dirname } from "node:path";

// Runs AnimeStudio as `runAnimeStudio` does, but waits for the free memory to clear the floor and runs the process at
// Below-normal priority (under the utility QoS clamp on macOS, where a nice value leaves it competing with the
// Foreground), so a long sweep of the blocks never slows the machine the session works on
export const runAnimeStudioBelowNormal = async (args: string[], options: AnimeStudioOptions): Promise<void> => {
  assertAnimeStudioReady(options);
  await waitForFreeMemory();
  const { args: spawnArgs, command } = getUtilityClampedCommand(
    options.executablePath,
    getAnimeStudioArgs(args, options.game),
  );
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, spawnArgs, {
      cwd: dirname(options.executablePath),
      stdio: ["ignore", "ignore", "pipe"],
    });
    if (process.platform !== "darwin" && child.pid !== undefined)
      setPriority(child.pid, constants.priority.PRIORITY_BELOW_NORMAL);
    const errorChunks: Buffer[] = [];
    child.stderr.on("data", (chunk: Buffer) => errorChunks.push(chunk));
    child.on("error", reject);
    child.on("close", (status) => {
      if (status === 0) resolve();
      else
        reject(
          new InvalidOperationError(
            Operation.Create,
            "AnimeStudio",
            Buffer.concat(errorChunks).toString("utf8") || `exited with ${status}`,
          ),
        );
    });
  });
};
