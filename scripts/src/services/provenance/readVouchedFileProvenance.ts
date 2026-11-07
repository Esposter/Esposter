import type { Provenance } from "#src/models/provenance/Provenance";

import { assertVouched } from "#src/services/provenance/assertVouched";
import { readFileProvenance } from "#src/services/provenance/readFileProvenance";
import { basename } from "node:path";

// The sidecar of a file input a consumer may read, refused when the file has none or one that names another game version
export const readVouchedFileProvenance = async (file: string, gameVersion: string): Promise<Provenance> =>
  assertVouched(await readFileProvenance(file), basename(file), gameVersion);
