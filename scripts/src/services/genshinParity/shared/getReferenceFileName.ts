import { REFERENCE_FILE_EXTENSION } from "#src/services/genshinParity/reference/constants";

// The committed file a reference is held as, named by its id, packed as WebP
export const getReferenceFileName = (referenceId: string): string => `${referenceId}.${REFERENCE_FILE_EXTENSION}`;
