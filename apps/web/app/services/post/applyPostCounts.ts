import type { PostCounts } from "@/services/post/postCountHooks";
import type { PostInPost } from "@esposter/db-schema";

// Writes one read's counts onto the copies a store holds of those posts. A copy the read does not name keeps its own
export const applyPostCounts = (
  copies: Pick<PostInPost, "commentCount" | "id" | "likeCount">[],
  postCounts: PostCounts,
) => {
  for (const { commentCount, id, likeCount } of postCounts)
    for (const copy of copies) {
      if (copy.id !== id) continue;

      copy.commentCount = commentCount;
      copy.likeCount = likeCount;
    }
};
