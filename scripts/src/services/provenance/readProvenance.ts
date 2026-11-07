import type { Provenance } from "#src/models/provenance/Provenance";

import { PROVENANCE_NAME } from "#src/services/provenance/constants";
import { readStamp } from "#src/services/provenance/readStamp";
import { join } from "node:path";

// The one reader of a folder output's stamp: the one a directory holds, or undefined when it holds none
export const readProvenance = (directory: string): Promise<Provenance | undefined> =>
  readStamp(join(directory, PROVENANCE_NAME));
