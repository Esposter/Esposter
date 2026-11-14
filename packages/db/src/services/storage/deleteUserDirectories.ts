import type { R2Bucket } from "@cloudflare/workers-types";
import type { UserInAuth } from "@esposter/db-schema";

import { deleteDirectory } from "#src/services/storage/deleteDirectory";

// Removes everything a user wrote under their own `{userId}/` prefix, in each bucket given. The trailing slash is
// What keeps one user's prefix from matching another's id, and a prefix with nothing left in it is already done.
export const deleteUserDirectories = async (buckets: R2Bucket[], userId: UserInAuth["id"]): Promise<void> => {
  await Promise.all(buckets.map((bucket) => deleteDirectory(bucket, `${userId}/`)));
};
