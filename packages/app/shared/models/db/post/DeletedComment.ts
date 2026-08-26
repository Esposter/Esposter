import type { Post } from "@esposter/db-schema";

// The deleted comment, the posts whose counters moved, and how many rows went. A delete cascades down the
// parentId chain, so the count is the only record of a subtree the client may never have read
export interface DeletedComment {
  ancestorIds: Post["id"][];
  comment: Post;
  noRemovedComments: number;
}
