import type { Filter } from "@esposter/db";

export const getIsSearchQueryEmpty = (query: string, filters: Filter[]) => !query.trim() && filters.length === 0;
