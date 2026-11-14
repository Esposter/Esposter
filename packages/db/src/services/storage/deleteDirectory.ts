import type { R2Bucket } from "@cloudflare/workers-types";

import { deleteBlobs } from "#src/services/storage/deleteBlobs";
import { listBlobNames } from "#src/services/storage/listBlobNames";

export const deleteDirectory = async (bucket: R2Bucket, prefix = ""): Promise<void> => {
  await deleteBlobs(bucket, await listBlobNames(bucket, prefix));
};
