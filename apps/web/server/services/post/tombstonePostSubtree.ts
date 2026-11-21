import type { Context } from "#server/trpc/context";
import type { SQL } from "drizzle-orm";

import { postsInPost } from "@esposter/db-schema";
import { and, sql } from "drizzle-orm";

// The subtree is tombstoned rather than deleted: each row keeps its place and takes the version the removal raises,
// So a read that answered before it cannot bring a reply back. Its text is cleared, so no reader is handed the words
// Of a removed post. The update lands only while the owner's row is in the table, which is what gates the removal
export const tombstonePostSubtree = (db: Context["db"], subtreeWhere: SQL | undefined, ownedWhere: SQL | undefined) =>
  db
    .update(postsInPost)
    .set({ deletedAt: new Date(), description: "", title: "" })
    .where(and(subtreeWhere, sql`exists (select 1 from ${postsInPost} where ${ownedWhere})`))
    .returning();
