import type { PostInPost } from "@esposter/db-schema";

// The posts whose counters moved, and every post the delete removed. A delete cascades down the parentId chain, so the
// Removed ids are the only record of a subtree the client may never have read
export interface DeletedComment {
  ancestorIds: PostInPost["id"][];
  removedIds: PostInPost["id"][];
}
