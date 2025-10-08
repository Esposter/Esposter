import type { Filter } from "@esposter/shared";

export const getIsSearchQueryEmpty = (query: string, filters: Filter[]) => !query.trim() && filters.length === 0;
