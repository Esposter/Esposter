import { REFERENCE_OBJECT_FOLDER } from "#src/services/genshinParity/reference/constants";

// The key a stored object is kept under in each bucket: its hash and the extension its bytes sniff as.
// Identical bytes are one object, whatever file they were read from
export const getObjectKey = (sha256: string, extension: string): string =>
  `${REFERENCE_OBJECT_FOLDER}/${sha256}.${extension}`;
