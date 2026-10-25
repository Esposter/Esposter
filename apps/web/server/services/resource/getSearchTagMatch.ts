import { escapeLike } from "#server/services/db/escapeLike";
import { resourcesInResource } from "@esposter/db-schema";
import { sql } from "drizzle-orm";

// The tag arm of a search: a tag whose name or value holds the query. The pairs are expanded for this row alone,
// And the owner filter already bounds the rows the scan reaches
export const getSearchTagMatch = (searchQuery: string) => {
  const pattern = `%${escapeLike(searchQuery)}%`;
  return sql`exists (select 1 from jsonb_each_text(${resourcesInResource.tags}) as pair where pair.key ilike ${pattern} or pair.value ilike ${pattern})`;
};
