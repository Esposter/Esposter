import type { ProvenanceOptions } from "#src/models/provenance/ProvenanceOptions";

import { buildProvenance } from "#src/services/provenance/buildProvenance";
import { PROVENANCE_NAME } from "#src/services/provenance/constants";
import { writeJsonFile } from "#src/services/shared/writeJsonFile";
import { join } from "node:path";

// Stamps a folder output, written inside the folder as `provenance.json`
export const writeProvenance = async (directory: string, options: ProvenanceOptions): Promise<void> => {
  writeJsonFile(join(directory, PROVENANCE_NAME), await buildProvenance(options));
};
