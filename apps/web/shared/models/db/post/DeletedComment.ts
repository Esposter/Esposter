import type { PostInPost } from "@esposter/db-schema";

// The posts whose counters moved, and every post the delete removed, each as the tombstone the removal left. A removal
// Takes the whole subtree beneath the comment, and the client may never have read those rows, so each one is answered
export interface DeletedComment {
  ancestorIds: PostInPost["id"][];
  removedPosts: PostInPost[];
}
