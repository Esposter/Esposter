import type { PageSort, postsInPost } from "@esposter/db-schema";
import type { SQLWrapper } from "drizzle-orm";

import { createPageSort } from "@esposter/db";

// A post sort bound to the posts table's columns, the one table every feed and thread reads from. A sort names one of
// The three columns bound here, so the keys are the columns' own names
export const bindPostSort = (post: typeof postsInPost, sort: PageSort) => {
  const columns: Record<string, SQLWrapper> = { id: post.id, likeCount: post.likeCount, ranking: post.ranking };
  return createPageSort(columns, sort);
};
