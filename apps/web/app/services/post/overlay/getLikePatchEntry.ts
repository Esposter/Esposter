import type { Entry } from "#src/models/shared/overlay/Entry";
import type { LikeInPost } from "@esposter/db-schema";

import { likeTable } from "#src/services/post/overlay/constants";
import { getLikeRowKey } from "#src/services/post/overlay/getLikeRowKey";

// The named fields of a live vote the overlay holds are set: a change of value, or a removal as a deletedAt. A removed
// or unheld vote is left as it is, since no change can be drawn on a vote that is not there
export const getLikePatchEntry =
  (userId: LikeInPost["userId"], postId: LikeInPost["postId"], patch: Partial<LikeInPost>): Entry =>
  (view) => {
    const key = getLikeRowKey(userId, postId);
    const like = view.get(likeTable, key);
    if (like && !like.deletedAt) view.set(likeTable, key, { ...like, ...patch });
  };
