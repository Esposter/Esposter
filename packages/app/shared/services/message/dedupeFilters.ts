import type { Filter } from "@esposter/shared";

export const dedupeFilters = (filters: Filter[]): Filter[] =>
  filters.filter(
    (filter, index, self) =>
      index === self.findIndex((selfFilter) => selfFilter.type === filter.type && selfFilter.value === filter.value),
  );
