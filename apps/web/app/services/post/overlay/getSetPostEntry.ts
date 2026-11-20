import type { Draft } from "#src/models/shared/overlay/Draft";
import type { Entry } from "#src/models/shared/overlay/Entry";
import type { PostInPost } from "@esposter/db-schema";

import { postTable } from "#src/services/post/overlay/constants";

// A post the write creates, drawn at once with no version until the server names one
export const getSetPostEntry =
  (post: Draft<PostInPost>): Entry =>
  (view) => {
    view.set(postTable, [post.id], post);
  };
