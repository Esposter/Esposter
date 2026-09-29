import type { UserInAuth } from "@esposter/db-schema";

import { PostInPostRelations } from "@esposter/db-schema";

// The filtered likes relation is only the fetch strategy for `PostInPostWithRelations.viewerLike` —
// It loads at most the viewer's own like row instead of every like of every post
export const getViewerPostRelations = (userId: UserInAuth["id"]) =>
  ({ ...PostInPostRelations, likes: { where: { userId: { eq: userId } } } }) as const;
