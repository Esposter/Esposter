import type { Filter } from "@esposter/db-schema";

import { FilterType } from "@esposter/db-schema";

// The room ids a search's `in:` filters name, in the order they were given. The schema holds every `in:` value to a room id
export const getInFilterRoomIds = (filters: Filter[]): string[] =>
  filters.flatMap(({ type, value }) => (type === FilterType.In && typeof value === "string" ? [value] : []));
