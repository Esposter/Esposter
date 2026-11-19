import type { Context } from "#server/trpc/context";
import type { postsInPost, UserInAuth } from "@esposter/db-schema";

import { blocksInSocial } from "@esposter/db-schema";
import { and, eq, isNull, notInArray } from "drizzle-orm";

// Hides posts/comments authored by users the viewer has blocked — they are hidden, not erased,
// So denormalized counters (`likeCount`/`commentCount`) intentionally keep counting them. A removed block is a tombstone, so
// Only the live ones hide
export const getNotBlockedWhere = (postsTable: typeof postsInPost, db: Context["db"], userId: UserInAuth["id"]) =>
  notInArray(
    postsTable.userId,
    db
      .select({ blockedId: blocksInSocial.blockedId })
      .from(blocksInSocial)
      .where(and(eq(blocksInSocial.blockerId, userId), isNull(blocksInSocial.deletedAt))),
  );
