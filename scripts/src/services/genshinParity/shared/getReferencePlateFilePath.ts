import { REFERENCE_FILES_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { getReferencePlateFileName } from "#src/services/genshinParity/shared/getReferencePlateFileName";
import { join } from "node:path";

// Where a reference's committed plate is: flat in the references folder, named by its id
export const getReferencePlateFilePath = (referenceId: string): string =>
  join(REFERENCE_FILES_DIRECTORY, getReferencePlateFileName(referenceId));
