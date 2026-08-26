import type { Post, PostWithRelations } from "@esposter/db-schema";

// The new comment and the posts whose counters moved with it. The server walks the parentId chain to write them,
// So it is the one thing that already knows the answer — a client that re-derived it would be scanning its own
// Loaded rows a level at a time to learn what the write already established
export interface CreatedComment {
  ancestorIds: Post["id"][];
  comment: PostWithRelations;
}
