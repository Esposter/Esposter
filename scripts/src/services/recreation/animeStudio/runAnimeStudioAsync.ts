import type { AnimeStudioOptions } from "#src/models/recreation/animeStudio/AnimeStudioOptions";

import { getUtilityClampedCommand } from "#src/services/machine/getUtilityClampedCommand";
import { assertAnimeStudioReady } from "#src/services/recreation/animeStudio/assertAnimeStudioReady";
import { getAnimeStudioArgs } from "#src/services/recreation/animeStudio/getAnimeStudioArgs";
import { judgeAnimeStudioRun } from "#src/services/recreation/animeStudio/judgeAnimeStudioRun";
import { spawn } from "@esposter/shared-node/child-process";
import { constants, setPriority } from "node:os";
import { dirname } from "node:path";

// Runs AnimeStudio as `runAnimeStudio` does, with the same verdict on its run, but without blocking, so the shards of
// A map run as processes of their own at once. Each run's output is held until it exits, which a map's warnings keep
// Small. A below-normal run runs at Below-normal priority (under the Utility QoS clamp on macOS, where a nice value leaves
// It competing with the Foreground), so a long sweep never slows the session the user works on; how many run at once is
// The caller's, sized to the memory by `getMemoryBoundedShardCount`
export const runAnimeStudioAsync = async (
  args: string[],
  options: AnimeStudioOptions,
  { belowNormal }: { belowNormal: boolean },
): Promise<void> => {
  assertAnimeStudioReady(options);
  const { args: spawnArgs, command } = getUtilityClampedCommand(
    options.executablePath,
    getAnimeStudioArgs(args, options.game),
  );
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, spawnArgs, {
      cwd: dirname(options.executablePath),
      stdio: ["ignore", "pipe", "pipe"],
    });
    if (belowNormal && process.platform !== "darwin" && child.pid !== undefined)
      setPriority(child.pid, constants.priority.PRIORITY_BELOW_NORMAL);
    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];
    child.stdout.on("data", (chunk: Buffer) => {
      stdoutChunks.push(chunk);
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderrChunks.push(chunk);
    });
    child.on("error", reject);
    child.on("close", (status) => {
      const stdout = Buffer.concat(stdoutChunks).toString("utf8");
      const stderr = Buffer.concat(stderrChunks).toString("utf8");
      const failure = judgeAnimeStudioRun(status, `${stdout}\n${stderr}`, stderr || stdout || `exited with ${status}`);
      if (failure) reject(failure);
      else resolve();
    });
  });
};
