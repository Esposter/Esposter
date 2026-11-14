import type { R2BucketClient } from "#src/models/cloudflare/R2BucketClient";

import { GAME_DATA_CACHE_CONTROL } from "#src/services/gameData/constants";

// Stores one object in every bucket that does not hold it, each bucket checked first, so an object is never uploaded twice.
// The file is streamed to each bucket it is written to, so a recording is never read whole into memory. Returns how many
// Buckets it uploaded to
export const putReferenceObject = async (key: string, file: Blob, bucketClients: R2BucketClient[]): Promise<number> => {
  const uploads = await Promise.all(
    bucketClients.map(async (bucketClient): Promise<number> => {
      if (await bucketClient.has(key)) return 0;
      await bucketClient.put(key, file, { cacheControl: GAME_DATA_CACHE_CONTROL });
      return 1;
    }),
  );
  return uploads.reduce((total, count) => total + count, 0);
};
