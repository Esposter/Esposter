import type { Filter } from "#shared/models/message/Filter";

export const getIsSearchQueryEmpty = (query: string, filters: Filter[]) => !query.trim() && filters.length === 0;
