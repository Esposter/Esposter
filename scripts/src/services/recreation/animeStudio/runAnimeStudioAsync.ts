import type { AnimeStudioOptions } from "#src/models/recreation/animeStudio/AnimeStudioOptions";

import { getUtilityClampedCommand } from "#src/services/machine/getUtilityClampedCommand";
import { assertAnimeStudioReady } from "#src/services/recreation/animeStudio/assertAnimeStudioReady";
import { getAnimeStudioArgs } from "#src/services/recreation/animeStudio/getAnimeStudioArgs";
import { judgeAnimeStudioRun } from "#src/services/recreation/animeStudio/judgeAnimeStudioRun";
import { spawn } from "@esposter/shared-node/child-process";
import { dirname } from "node:path";

// Runs AnimeStudio as `runAnimeStudio` does, with the same verdict on its run, but without blocking, so the shards of
// A map run as processes of their own at once. Each run's output is held until it exits, which a map's warnings keep small
export const runAnimeStudioAsync = (args: string[], options: AnimeStudioOptions): Promise<void> => {
  assertAnimeStudioReady(options);
  const { args: spawnArgs, command } = getUtilityClampedCommand(
    options.executablePath,
    getAnimeStudioArgs(args, options.game),
  );
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, spawnArgs, {
      cwd: dirname(options.executablePath),
      stdio: ["ignore", "pipe", "pipe"],
    });
    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];
    child.stdout.on("data", (chunk: Buffer) => stdoutChunks.push(chunk));
    child.stderr.on("data", (chunk: Buffer) => stderrChunks.push(chunk));
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
