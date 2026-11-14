import type { R2BucketClient } from "#src/models/cloudflare/R2BucketClient";
import type { CharacterPackFile } from "#src/models/genshinAssets/characterPacks/CharacterPackFile";
import type { CloudflareEnvironment } from "@esposter/db-schema";

import { MAX_CONCURRENT_OBJECT_REQUESTS } from "#src/services/gameData/constants";
import { settleAll } from "@esposter/shared";
import { openAsBlob } from "node:fs";

// Every file uploads to every environment's bucket over the key it publishes under, replacing what the bucket holds there, so
// A rerun publishes whatever the packs now hold. Caches revalidate, since a rerun replaces a file in place
export const publishCharacterPacks = async (
  files: CharacterPackFile[],
  createBucketClientMap: () => Record<CloudflareEnvironment, R2BucketClient>,
): Promise<void> => {
  await Promise.all(
    Object.values(createBucketClientMap()).map((bucketClient) =>
      settleAll(
        files.map(({ key, localPath }) => async () => {
          await bucketClient.put(key, await openAsBlob(localPath), { cacheControl: "no-cache" });
        }),
        MAX_CONCURRENT_OBJECT_REQUESTS,
      ),
    ),
  );
};
