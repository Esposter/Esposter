import type { ListBlobNamesOptions } from "#src/models/storage/ListBlobNamesOptions";
import type { R2Bucket } from "@cloudflare/workers-types";

import { listBlobItems } from "#src/services/storage/listBlobItems";

export const listBlobNames = async (
  bucket: R2Bucket,
  prefix: string,
  { createdBefore }: ListBlobNamesOptions = {},
): Promise<string[]> =>
  (await listBlobItems(bucket, prefix))
    .filter(({ uploaded }) => !createdBefore || uploaded < createdBefore)
    .map(({ name }) => name);
