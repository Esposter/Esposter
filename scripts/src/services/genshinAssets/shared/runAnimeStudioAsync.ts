import { assertAnimeStudioReady } from "#src/services/genshinAssets/shared/assertAnimeStudioReady";
import { ANIMESTUDIO_CLI_PATH } from "#src/services/genshinAssets/shared/constants";
import { getAnimeStudioArgs } from "#src/services/genshinAssets/shared/getAnimeStudioArgs";
import { judgeAnimeStudioRun } from "#src/services/genshinAssets/shared/judgeAnimeStudioRun";
import { spawn } from "node:child_process";
import { dirname } from "node:path";

// Runs AnimeStudio as `runAnimeStudio` does, with the same verdict on its run, but without blocking, so the shards of
// A map run as processes of their own at once. Each run's output is held until it exits, which a map's warnings keep small
export const runAnimeStudioAsync = (args: string[]): Promise<void> => {
  assertAnimeStudioReady();
  return new Promise<void>((resolve, reject) => {
    const child = spawn(ANIMESTUDIO_CLI_PATH, getAnimeStudioArgs(args), {
      cwd: dirname(ANIMESTUDIO_CLI_PATH),
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
