import type { User } from "@esposter/db-schema";

import { PostRelations } from "@esposter/db-schema";

// The filtered likes relation is only the fetch strategy for `PostWithRelations.viewerLike` —
// It loads at most the viewer's own like row instead of every like of every post
export const getViewerPostRelations = (userId: User["id"]) =>
  ({
    ...PostRelations,
    likes: { where: { userId: { eq: userId } } },
  }) as const;
