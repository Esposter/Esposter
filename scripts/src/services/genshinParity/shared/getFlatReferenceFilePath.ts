import { REFERENCE_FILE_EXTENSION } from "#src/services/genshinParity/reference/constants";
import { REFERENCE_FILES_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { join } from "node:path";

// Where a reference that no fixture variant holds beside its snapshot is committed: flat in the references folder, named by its id
export const getFlatReferenceFilePath = (referenceId: string): string =>
  join(REFERENCE_FILES_DIRECTORY, `${referenceId}.${REFERENCE_FILE_EXTENSION}`);
