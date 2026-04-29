import type { Filter } from "@esposter/db-schema";

import { normalizeString } from "@esposter/shared";

export const getIsSearchQueryEmpty = (query: string, filters: Filter[]) =>
  !normalizeString(query) && filters.length === 0;
