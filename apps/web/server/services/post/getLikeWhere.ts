import type { Like } from "@esposter/db-schema";

import { likes } from "@esposter/db-schema";
import { and, eq } from "drizzle-orm";

// A like has no id of its own: the pair is its whole key, so this is the row a member's vote on a post is
export const getLikeWhere = (postId: Like["postId"], userId: Like["userId"]) =>
  and(eq(likes.userId, userId), eq(likes.postId, postId));
