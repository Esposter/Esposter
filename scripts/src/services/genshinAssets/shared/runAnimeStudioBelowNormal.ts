import { assertAnimeStudioReady } from "#src/services/genshinAssets/shared/assertAnimeStudioReady";
import { ANIMESTUDIO_CLI_PATH } from "#src/services/genshinAssets/shared/constants";
import { getAnimeStudioArgs } from "#src/services/genshinAssets/shared/getAnimeStudioArgs";
import { waitForFreeMemory } from "#src/services/genshinAssets/shared/waitForFreeMemory";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { spawn } from "node:child_process";
import { constants, setPriority } from "node:os";
import { dirname } from "node:path";

// Runs AnimeStudio as `runAnimeStudio` does, but waits for the free memory to clear the floor and runs the process at
// Below-normal priority, so a long sweep of the blocks never slows the machine the session works on
export const runAnimeStudioBelowNormal = async (args: string[]): Promise<void> => {
  assertAnimeStudioReady();
  await waitForFreeMemory();
  await new Promise<void>((resolve, reject) => {
    const child = spawn(ANIMESTUDIO_CLI_PATH, getAnimeStudioArgs(args), {
      cwd: dirname(ANIMESTUDIO_CLI_PATH),
      stdio: ["ignore", "ignore", "pipe"],
    });
    if (child.pid !== undefined) setPriority(child.pid, constants.priority.PRIORITY_BELOW_NORMAL);
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
