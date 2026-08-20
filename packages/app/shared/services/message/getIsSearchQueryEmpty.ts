import type { Filter } from "@esposter/db-schema";

import { getSearchableFilters } from "#shared/services/message/getSearchableFilters";
import { normalizeString } from "@esposter/shared";

// A pending filter is not a search — it is a chip waiting for a value, and searching on it would send its "" to
// A service that rejects it. So emptiness asks the same question the search itself does.
export const getIsSearchQueryEmpty = (query: string, filters: Filter[]) =>
  normalizeString(query) === "" && getSearchableFilters(filters).length === 0;
