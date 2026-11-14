import type { UserDataArchive } from "#src/models/user/UserDataArchive";
import type { UserInAuth } from "@esposter/db-schema";

import { db } from "#src/services/shared/db";

// Each of the person's posts as its text, its placement and the time it was written.
// A post's like and comment counts and its ranking are other people's activity on it, so they are left out
export const writePostEntries = async (archive: UserDataArchive, userId: UserInAuth["id"]): Promise<void> => {
  const posts = await db.query.postsInPost.findMany({
    columns: { createdAt: true, depth: true, description: true, id: true, parentId: true, title: true },
    where: { userId: { eq: userId } },
  });
  for (const post of posts)
    // oxlint-disable-next-line no-await-in-loop -- Bounded concurrency: one post at a time, as the archive is written
    await archive.addJsonEntry(`posts/${post.id}.json`, post);
};
