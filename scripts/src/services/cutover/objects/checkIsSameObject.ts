import type { BlobEntry } from "#src/models/cutover/BlobEntry";
import type { R2Object } from "#src/models/cutover/R2Object";

import { base64ToHex } from "#src/services/cutover/objects/base64ToHex";

// Whether a stored object already holds the blob's bytes.
// Only an MD5 proves that, so a blob Azure stored no digest for is never proven identical and is copied again
export const checkIsSameObject = (blob: BlobEntry, stored: R2Object | undefined): boolean =>
  stored !== undefined && blob.md5 !== undefined && stored.size === blob.size && base64ToHex(blob.md5) === stored.etag;
