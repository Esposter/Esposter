import { resourcesInResource } from "@esposter/db-schema";
import { sql } from "drizzle-orm";

// The resources whose name or tags hold one of the words, read from the search index the triggers keep beside
// `resources`. The index is matched in one pass and the rows it names are narrowed by the owner and the soft delete,
// which read the row itself
export const getResourceSearchMatch = (expression: string) =>
  sql`${resourcesInResource.id} in (select id from resources_search where resources_search match ${expression})`;
