import { REFERENCE_SCRATCH_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { join } from "node:path";

// Where a person saves a reference's plate screenshot before `references pack` commits it, named by its id
export const getScratchPlatePath = (referenceId: string): string =>
  join(REFERENCE_SCRATCH_DIRECTORY, `${referenceId}.plate.png`);
