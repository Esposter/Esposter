import type { LikeInPost } from "@esposter/db-schema";

// The key of a vote's row: the member and the post, in the order the table's composite key names them
export const getLikeRowKey = (userId: LikeInPost["userId"], postId: LikeInPost["postId"]): [string, string] => [
  userId,
  postId,
];
