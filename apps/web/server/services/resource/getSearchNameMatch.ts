import { escapeLike } from "#server/services/db/escapeLike";
import { SEARCH_SIMILARITY_THRESHOLD } from "#server/services/resource/constants";
import { getSearchSimilarity } from "#server/services/resource/getSearchSimilarity";
import { resourcesInResource } from "@esposter/db-schema";
import { ilike, sql } from "drizzle-orm";

// The name arm of a search: a name holding the query as a substring, or one close to it by trigram similarity
export const getSearchNameMatch = (searchQuery: string) => {
  const substring = ilike(resourcesInResource.name, `%${escapeLike(searchQuery)}%`);
  return sql`(${substring} or ${getSearchSimilarity(searchQuery)} > ${SEARCH_SIMILARITY_THRESHOLD})`;
};
