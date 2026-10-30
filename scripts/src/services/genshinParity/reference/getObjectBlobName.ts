import { REFERENCE_BLOB_FOLDER } from "#src/services/genshinParity/reference/constants";

// The name a stored object is kept under in each account: its hash and the extension its bytes sniff as.
// Identical bytes are one object, whatever file they were read from
export const getObjectBlobName = (sha256: string, extension: string): string =>
  `${REFERENCE_BLOB_FOLDER}/${sha256}.${extension}`;
