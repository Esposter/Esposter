import type { ComputeArea } from "#src/models/fleet/ComputeArea";
import type { QueueFile } from "#src/models/fleet/QueueFile";

import { COMPUTE_QUEUE_INDEX_FILE, COMPUTE_QUEUE_PAGE_FILE } from "#src/services/fleet/constants";
import { parseComputePhases } from "#src/services/fleet/parseComputePhases";
import { parseComputeQueue } from "#src/services/fleet/parseComputeQueue";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { basename, dirname } from "node:path";

// Every area's page in the compute folder, the index and the specs aside, in path order. Each takes the kind and phase its
// Design's folder holds in the index's Phases table, and a design with no row there fails the read naming it
export const readComputeAreas = (files: readonly QueueFile[]): ComputeArea[] => {
  const indexFile = files.find(({ path }) => basename(path) === COMPUTE_QUEUE_INDEX_FILE);
  const folderComputePhaseMap = parseComputePhases(indexFile?.text ?? "");
  return files
    .filter(({ path }) => basename(path) === COMPUTE_QUEUE_PAGE_FILE)
    .toSorted((firstFile, secondFile) => firstFile.path.localeCompare(secondFile.path))
    .map(({ path, text }) => {
      const folder = basename(dirname(path));
      const page = folderComputePhaseMap.get(folder);
      if (page === undefined)
        throw new InvalidOperationError(
          Operation.Read,
          path,
          "its area has no row in the Phases table of the compute README",
        );
      const reading = parseComputeQueue(text);
      return {
        folder,
        kind: page.kind,
        phase: page.phase,
        queue: reading.entries.map((entry) => ({ ...entry, phase: page.phase })),
        skipped: reading.skipped,
        waiting: reading.waiting.map((entry) => ({ ...entry, phase: page.phase })),
      };
    });
};
