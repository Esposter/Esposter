import type { Draft } from "#src/models/shared/overlay/Draft";
import type { Entry } from "#src/models/shared/overlay/Entry";
import type { PostInPost } from "@esposter/db-schema";

import { postTable } from "#src/services/post/overlay/constants";

// A post the write creates, drawn at once with no version until the server names one. A reply moves the count of each
// Post Above it, and the parent's chain names every one of them, so each is read by its key, held or not, and a write
// To any of Them queues behind the reply
export const getSetPostEntry =
  (post: Draft<PostInPost>): Entry =>
  (view) => {
    if (post.parentId) {
      const parent = view.get(postTable, [post.parentId]);
      if (parent) for (const id of [...parent.ancestorIds, parent.id]) view.get(postTable, [id]);
    }
    view.set(postTable, [post.id], post);
  };
