import type { PostInPost } from "@esposter/db-schema";

// The fields one read of the server's counts sets on a copy of a post
export type PostCountFields = Pick<PostInPost, "commentCount" | "id" | "likeCount">;
export type PostCounts = PostCountFields[];

// Writes one read's counts onto the copies a store holds of those posts. A copy the read does not name keeps its own
export const applyPostCounts = (copies: PostCountFields[], postCounts: PostCounts) => {
  for (const { commentCount, id, likeCount } of postCounts)
    for (const copy of copies) {
      if (copy.id !== id) continue;

      copy.commentCount = commentCount;
      copy.likeCount = likeCount;
    }
};
