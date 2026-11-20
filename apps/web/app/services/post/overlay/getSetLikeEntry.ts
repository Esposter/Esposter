import type { Draft } from "#src/models/shared/overlay/Draft";
import type { Entry } from "#src/models/shared/overlay/Entry";
import type { LikeInPost } from "@esposter/db-schema";

import { likeTable } from "#src/services/post/overlay/constants";
import { getLikeRowKey } from "#src/services/post/overlay/getLikeRowKey";

// The member's vote on a post is drawn as the vote it would make, at once
export const getSetLikeEntry =
  (like: Draft<LikeInPost>): Entry =>
  (view) => {
    view.set(likeTable, getLikeRowKey(like.userId, like.postId), like);
  };
