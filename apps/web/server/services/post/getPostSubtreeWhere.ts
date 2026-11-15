import { postsInPost } from "@esposter/db-schema";
import { and, eq, or, sql } from "drizzle-orm";

// The post and every reply beneath it. Every reply beneath a post shares the post's thread, its first ancestor, so the
// Thread's index bounds the rows the ancestor check runs over, and the post itself is named by its own id
export const getPostSubtreeWhere = (postId: string, threadRootId: string) =>
  or(
    eq(postsInPost.id, postId),
    and(
      sql`json_extract(${postsInPost.ancestorIds}, '$[0]') = ${threadRootId}`,
      sql`exists (select 1 from json_each(${postsInPost.ancestorIds}) where json_each.value = ${postId})`,
    ),
  );
