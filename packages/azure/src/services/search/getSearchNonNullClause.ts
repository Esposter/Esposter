import type { SearchClause } from "#src/models/search/SearchClause";

import { BinaryOperator } from "@esposter/db-schema";

export const getSearchNonNullClause = <T extends object>(key: keyof T & string): SearchClause<T> => ({
  key,
  operator: BinaryOperator.Ne,
  value: null,
});
