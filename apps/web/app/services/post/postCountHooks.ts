import type { PostInPost } from "@esposter/db-schema";

import { createHookRegistry } from "@/services/shared/createHookRegistry";

export type PostCounts = Pick<PostInPost, "commentCount" | "id" | "likeCount">[];
// The counts one read of the server returns for a set of posts. Each store holding copies of a post registers how to
// Apply them to its own copies, so a single read reaches every copy on screen and none is missed or read twice
export const postCountHooks = createHookRegistry<(postCounts: PostCounts) => void>();
