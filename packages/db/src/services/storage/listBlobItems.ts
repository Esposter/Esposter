import type { ListedBlobItem } from "#src/models/storage/ListedBlobItem";
import type { R2Bucket } from "@cloudflare/workers-types";

import { listR2Objects } from "#src/services/storage/listR2Objects";

// Every object under a prefix, by its name and when it was uploaded. A page size is R2's listing limit, which
// Production leaves To R2's default
export const listBlobItems = async (bucket: R2Bucket, prefix: string, pageSize?: number): Promise<ListedBlobItem[]> =>
  (await listR2Objects(bucket, prefix, undefined, pageSize)).map(({ key, uploaded }) => ({ name: key, uploaded }));
