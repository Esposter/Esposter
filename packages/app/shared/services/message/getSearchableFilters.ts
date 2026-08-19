import type { Filter } from "@esposter/db-schema";

import { getIsFilterPending } from "#shared/services/message/getIsFilterPending";

// The filters a search actually runs with: a pending one has no value to narrow on, and a repeat of one already
// In the list narrows nothing its first copy did not. Every caller wants both, so neither is a call-site step.
export const getSearchableFilters = (filters: Filter[]): Filter[] =>
  filters.filter(
    (filter, index, self) =>
      !getIsFilterPending(filter) &&
      index === self.findIndex((selfFilter) => selfFilter.type === filter.type && selfFilter.value === filter.value),
  );
