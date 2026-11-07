import type { ProvenanceOptions } from "#src/models/provenance/ProvenanceOptions";

import { buildProvenance } from "#src/services/provenance/buildProvenance";
import { getSidecarPath } from "#src/services/provenance/getSidecarPath";
import { writeJsonFile } from "#src/services/shared/writeJsonFile";

// Stamps a file output with a sidecar beside it, `<file name>.provenance.json`
export const writeFileProvenance = async (file: string, options: ProvenanceOptions): Promise<void> => {
  writeJsonFile(getSidecarPath(file), await buildProvenance(options));
};
