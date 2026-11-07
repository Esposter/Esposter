import type { ProvenanceOptions } from "#src/models/provenance/ProvenanceOptions";

import { buildProvenance } from "#src/services/provenance/buildProvenance";
import { getSidecarPath } from "#src/services/provenance/getSidecarPath";
import { removeFileProvenance } from "#src/services/provenance/removeFileProvenance";
import { writeJsonFile } from "#src/services/shared/writeJsonFile";

// Writes file outputs and stamps them in the order that never leaves a stamp beside bytes it did not describe: the earlier
// Sidecars go first, then the write, then one stamp, built once, beside every file the write named. A write that fails
// Before its stamp therefore leaves no sidecar beside its new bytes
export const writeStampedFiles = async (
  files: readonly string[],
  options: ProvenanceOptions,
  write: () => Promise<void> | void,
): Promise<void> => {
  await removeFileProvenance(files);
  await write();
  const provenance = await buildProvenance(options);
  for (const file of files) writeJsonFile(getSidecarPath(file), provenance);
};
