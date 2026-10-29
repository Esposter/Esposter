import { REFERENCE_FILE_EXTENSION, REFERENCE_PLATE_SUFFIX } from "#src/services/genshinParity/reference/constants";
import { REFERENCE_FILES_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { join } from "node:path";

// Where a reference's committed plate is: flat in the references folder, named by its id
export const getReferencePlateFilePath = (referenceId: string): string =>
  join(REFERENCE_FILES_DIRECTORY, `${referenceId}${REFERENCE_PLATE_SUFFIX}.${REFERENCE_FILE_EXTENSION}`);
