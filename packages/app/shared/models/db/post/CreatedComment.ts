import type { Post, PostWithRelations } from "@esposter/db-schema";

// The new comment and the posts whose counters moved with it. Nothing walks the chain to find them: the row the
// Reply was written under carries its own ancestors, so the write inherits that list and moves the counters on it
// In one statement — and hands the list back, because a client re-deriving it would be scanning its own loaded
// Rows a level at a time to learn what the write already established
export interface CreatedComment {
  ancestorIds: Post["id"][];
  comment: PostWithRelations;
}
