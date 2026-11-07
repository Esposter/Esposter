import { getSidecarPath } from "#src/services/provenance/getSidecarPath";
import { removeFileProvenance } from "#src/services/provenance/removeFileProvenance";
import { existsSync } from "node:fs";
import { copyFile } from "node:fs/promises";

// Carries a file output's sidecar along with the copy of its bytes, so the copy vouches for what it holds. A source with
// No sidecar leaves the target with none, rather than the stamp its earlier bytes had
export const copyFileProvenance = async (source: string, target: string): Promise<void> => {
  if (!existsSync(getSidecarPath(source))) {
    await removeFileProvenance([target]);
    return;
  }
  await copyFile(getSidecarPath(source), getSidecarPath(target));
};
