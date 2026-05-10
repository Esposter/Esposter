import type { Clause } from "@esposter/db-schema";

import { BinaryOperator } from "@esposter/db-schema";
// Azure Search actually supports null values c:
export const getSearchNullClause = <T extends object>(key: keyof T & string): Clause<T> => ({
  key,
  operator: BinaryOperator.eq,
  value: null,
});
