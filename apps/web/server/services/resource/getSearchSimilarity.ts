import { resourcesInResource } from "@esposter/db-schema";
import { sql } from "drizzle-orm";

// Not index-backed — resources_name_trgm_index serves the `ilike` arm of the search, not a `similarity()` inequality
export const getSearchSimilarity = (searchQuery: string) =>
  sql`similarity(${resourcesInResource.name}, ${searchQuery})`;
