import type { Entry } from "#src/models/shared/overlay/Entry";
import type { PostInPost } from "@esposter/db-schema";

import { postTable } from "#src/services/post/overlay/constants";

// The named fields of a post the overlay holds are set, which is how an edit and a removal are drawn. A post it does not
// Hold is left as it is, so the write it belongs to changes nothing on screen
export const getPostPatchEntry =
  (id: PostInPost["id"], patch: Partial<PostInPost>): Entry =>
  (view) => {
    const post = view.get(postTable, [id]);
    if (post) view.set(postTable, [id], { ...post, ...patch });
  };
