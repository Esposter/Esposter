import type { Post, PostWithRelations } from "@esposter/db-schema";

// The new comment and the posts whose counters moved with it. The row the reply was written under carries its own
// Ancestors, so the write inherits that list, moves the counters on it in one statement, and hands it back
export interface CreatedComment {
  ancestorIds: Post["id"][];
  comment: PostWithRelations;
}
