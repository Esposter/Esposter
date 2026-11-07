import { getSidecarPath } from "#src/services/provenance/getSidecarPath";
import { rm } from "node:fs/promises";

// Removes the sidecars of file outputs, so a file rewritten under an earlier sidecar is never vouched for by the stamp of
// Its earlier bytes
export const removeFileProvenance = async (files: readonly string[]): Promise<void> => {
  await Promise.all(files.map((file) => rm(getSidecarPath(file), { force: true })));
};
