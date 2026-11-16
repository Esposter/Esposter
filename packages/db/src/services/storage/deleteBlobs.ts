import type { R2Bucket } from "@cloudflare/workers-types";

import { MAX_DELETE_KEYS_PER_REQUEST } from "#src/services/storage/constants";
import { chunk } from "@esposter/shared";

// Deletes the named objects in batches of what one request takes. A key already gone is not an error: every caller is a
// Teardown that must converge when it re-runs, so an object an earlier attempt removed is the state being asked for
export const deleteBlobs = async (bucket: R2Bucket, blobNames: string[]): Promise<void> => {
  for (const blobNameBatch of chunk(blobNames, MAX_DELETE_KEYS_PER_REQUEST))
    // oxlint-disable-next-line no-await-in-loop -- Committed prefix: a failed batch stops the batches behind it, and the ones before it stay deleted, so a re-run converges
    await bucket.delete(blobNameBatch);
};
