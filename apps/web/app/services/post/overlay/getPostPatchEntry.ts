import type { Entry } from "#src/models/shared/overlay/Entry";
import type { PostInPost } from "@esposter/db-schema";

import { postTable } from "#src/services/post/overlay/constants";
import { getHeldRowEntry } from "#src/services/shared/overlay/getHeldRowEntry";

// The named fields of a post the overlay holds are set, which is how an edit and a removal are drawn. A post it does
// Not Hold is left as it is, so the write it belongs to changes nothing on screen
export const getPostPatchEntry = (id: PostInPost["id"], patch: Partial<PostInPost>): Entry =>
  getHeldRowEntry(postTable, [id], (post) => ({ ...post, ...patch }));
