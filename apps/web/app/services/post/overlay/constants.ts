import { createTable } from "#src/services/shared/overlay/createTable";
import { likesInPost, postsInPost } from "@esposter/db-schema";

// The post rows, comments included, and the vote rows the feed, the threads and the votes hold on the overlay, one slot
// Each
export const postTable = createTable(postsInPost);
export const likeTable = createTable(likesInPost);
