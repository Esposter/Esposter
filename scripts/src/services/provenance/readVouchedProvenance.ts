import type { Provenance } from "#src/models/provenance/Provenance";

import { assertVouched } from "#src/services/provenance/assertVouched";
import { readProvenance } from "#src/services/provenance/readProvenance";
import { basename } from "node:path";

// The stamp of a folder input a consumer may read, refused when the folder holds none or one that names another game version
export const readVouchedProvenance = async (directory: string, gameVersion: string): Promise<Provenance> =>
  assertVouched(await readProvenance(directory), basename(directory), gameVersion);
