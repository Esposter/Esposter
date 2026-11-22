import type { Draft } from "#src/models/shared/overlay/Draft";
import type { Entry } from "#src/models/shared/overlay/Entry";
import type { LikeInPost } from "@esposter/db-schema";

import { likeTable, postTable } from "#src/services/post/overlay/constants";
import { getLikeRowKey } from "#src/services/post/overlay/getLikeRowKey";

// The member's vote on a post is drawn as the vote it would make, at once. The post the vote moves is read by its key,
// Since the server names its count and ranking, so a write to that post queues behind the vote
export const getSetLikeEntry =
  (like: Draft<LikeInPost>): Entry =>
  (view) => {
    view.get(postTable, [like.postId]);
    view.set(likeTable, getLikeRowKey(like.userId, like.postId), like);
  };
