import type { Clause } from "@esposter/azure";

import { BinaryOperator } from "@esposter/azure";

// Azure Search actually supports null values c:
export const getSearchNullClause = <T extends object>(key: keyof T & string): Clause<T> => ({
  key,
  operator: BinaryOperator.eq,
  value: null,
});
