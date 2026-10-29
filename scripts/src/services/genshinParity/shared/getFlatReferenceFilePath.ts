import { REFERENCE_FILES_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { getReferenceFileName } from "#src/services/genshinParity/shared/getReferenceFileName";
import { join } from "node:path";

// Where a reference that does not sit beside its fixture variant's snapshot is committed: flat in the references folder, named by its id
export const getFlatReferenceFilePath = (referenceId: string): string =>
  join(REFERENCE_FILES_DIRECTORY, getReferenceFileName(referenceId));
