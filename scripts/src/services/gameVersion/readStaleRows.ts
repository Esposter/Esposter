import type { StaleRow } from "#src/models/gameVersion/StaleRow";

import { groupStaleOutputs } from "#src/services/gameVersion/groupStaleOutputs";
import { listStampPaths } from "#src/services/gameVersion/listStampPaths";
import { readStampedOutput } from "#src/services/gameVersion/readStampedOutput";
import { getSidecarPath } from "#src/services/provenance/getSidecarPath";
import { existsSync } from "node:fs";

// The rows of the outputs under the directories, and beside the files, that are stamped with a game version other than the
// Install's or with none readable
export const readStaleRows = async (
  gameVersion: string,
  directories: readonly string[],
  files: readonly string[],
): Promise<StaleRow[]> => {
  const walkedStampPaths = (await Promise.all(directories.map((directory) => listStampPaths(directory)))).flat();
  const sidecarPaths = files.map((file) => getSidecarPath(file)).filter((sidecarPath) => existsSync(sidecarPath));
  const stampPaths = [...walkedStampPaths, ...sidecarPaths];
  const outputs = await Promise.all(stampPaths.map((stampPath) => readStampedOutput(stampPath)));
  return groupStaleOutputs(outputs, gameVersion);
};
