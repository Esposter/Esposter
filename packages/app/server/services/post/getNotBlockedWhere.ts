import type { Context } from "@@/server/trpc/context";
import type { posts, User } from "@esposter/db-schema";

import { blocks } from "@esposter/db-schema";
import { eq, notInArray } from "drizzle-orm";

// Hides posts/comments authored by users the viewer has blocked — they are hidden, not erased,
// So denormalized counters (`noLikes`/`noComments`) intentionally keep counting them
export const getNotBlockedWhere = (postsTable: typeof posts, db: Context["db"], userId: User["id"]) =>
  notInArray(
    postsTable.userId,
    db.select({ blockedId: blocks.blockedId }).from(blocks).where(eq(blocks.blockerId, userId)),
  );
