import type { UserInAuth } from "@esposter/db-schema";

import { getBucket } from "#src/services/storage/getBucket";
import { deleteUserDirectories } from "@esposter/db";
import { StorageBucket } from "@esposter/db-schema";

// The account's own directories are swept by its prefix, which lists no names. The blobs it is charged for went in the
// Step before, through the ledger, so nothing here needs to release a charge
export const deleteAccountBlobDirectories = async (userId: UserInAuth["id"]): Promise<void> => {
  const genshinAssetsBucket = getBucket(StorageBucket.GenshinAssets);
  const userBuckets = [StorageBucket.PublicUserAssets, StorageBucket.UserAssets, StorageBucket.ClickerAssets].map(
    (bucketName) => getBucket(bucketName),
  );
  await deleteUserDirectories([genshinAssetsBucket, ...userBuckets], userId);
};
