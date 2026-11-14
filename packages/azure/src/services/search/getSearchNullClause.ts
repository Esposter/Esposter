import type { SearchClause } from "#src/models/search/SearchClause";

import { BinaryOperator } from "@esposter/db-schema";

// Azure Search compares a field with null directly
export const getSearchNullClause = <T extends object>(key: keyof T & string): SearchClause<T> => ({
  key,
  operator: BinaryOperator.Eq,
  value: null,
});
