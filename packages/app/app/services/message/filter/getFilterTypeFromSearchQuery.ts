import { FilterTypes } from "@esposter/db-schema";
import { normalizeString } from "@esposter/shared";

// A trailing colon is what turns a typed word into a filter chip, but only when the word names a filter type.
// Anything else the user types — a word ending in a colon included — is search text and searches for itself.
export const getFilterTypeFromSearchQuery = (query: string) => {
  const normalizedQuery = normalizeString(query);
  if (!normalizedQuery.endsWith(":")) return undefined;
  const keyword = normalizedQuery.slice(0, -1).toLowerCase();
  return FilterTypes.find((filterType) => filterType.toLowerCase() === keyword);
};
