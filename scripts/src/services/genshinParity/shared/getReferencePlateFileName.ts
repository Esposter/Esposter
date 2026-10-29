import { REFERENCE_FILE_EXTENSION, REFERENCE_PLATE_SUFFIX } from "#src/services/genshinParity/reference/constants";

// The committed file a reference's plate is held as: the screenshot its clean plate's pixels come from, named by its id
export const getReferencePlateFileName = (referenceId: string): string =>
  `${referenceId}${REFERENCE_PLATE_SUFFIX}.${REFERENCE_FILE_EXTENSION}`;
