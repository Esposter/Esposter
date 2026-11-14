import type { Context } from "#server/trpc/context";

import { sql } from "drizzle-orm";

// The search index's rows for the words, each with its bm25 rank, where a lower rank is the closer match. The name is
// weighted 10 over the tags' 1, so among the matches the one whose name holds the word ranks first
export const getResourceSearchHits = (db: Context["db"], expression: string) =>
  db
    .select({
      id: sql<string>`resources_search.id`.as("id"),
      rank: sql<number>`bm25(resources_search, 10.0, 1.0, 0.0)`.as("rank"),
    })
    .from(sql`resources_search`)
    .where(sql`resources_search match ${expression}`)
    .as("resourceSearchHits");
