import type { ExecBackend } from "#src/models/exec/ExecBackend";
import type { ExecOptions } from "#src/models/exec/ExecOptions";
import type { PrepareLocation } from "#src/models/exec/snapshot/PrepareLocation";
import type { PrepareStep } from "#src/models/virrun/PrepareStep";

import { captureOverlayUpper } from "#src/services/exec/snapshot/captureOverlayUpper";
import { pruneToOutputs } from "#src/services/exec/snapshot/pruneToOutputs";
import { resolveSnapshotLocation } from "#src/services/exec/snapshot/resolveSnapshotLocation";
import { InvalidOperationError, Operation } from "@esposter/shared";
// Captures a framework's generated artifacts into the source-keyed prepare layer. Forks the deps snapshot as a
// Read-only lower (so `nuxt prepare` sees the sandbox's own Linux dep closure), keeps only the declared
// `outputs` (pruneToOutputs — the inverse of pruneSnapshotUpper), and publishes through the same barrier
// `createSnapshot` uses. Requires the deps snapshot to exist (the caller provisions it first). The publish
// Target is the caller's already-resolved `location`, not a re-resolve: the layer is published to the exact
// Path the caller will mount, so a source-hash shift between resolves can never leave the mounted upper unbuilt.
export const createPrepareLayer = async (
  backend: ExecBackend,
  prepareStep: PrepareStep,
  options: ExecOptions,
  { dir, upperDir }: PrepareLocation,
): Promise<void> => {
  const depsLocation = resolveSnapshotLocation(options.cwd);
  if (!depsLocation.exists)
    throw new InvalidOperationError(
      Operation.Create,
      createPrepareLayer.name,
      "no captured deps snapshot to fork for the prepare layer; run createSnapshot first",
    );
  await captureOverlayUpper(backend, prepareStep.command, options, {
    dir,
    failureLabel: "prepare command",
    lowerDirs: [depsLocation.upperDir],
    operationName: createPrepareLayer.name,
    // This layer owns only the declared outputs; the deps snapshot below supplies the dep tree the prepare churned
    prune: (captureUpperDir) => {
      pruneToOutputs(captureUpperDir, prepareStep.outputs);
    },
    upperDir,
  });
};
