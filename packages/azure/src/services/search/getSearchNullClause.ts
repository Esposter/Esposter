import type { Clause } from "#src/models/Clause";

import { BinaryOperator } from "#src/models/BinaryOperator";

// Azure Search actually supports null values c:
export const getSearchNullClause = <T extends object>(key: keyof T & string): Clause<T> => ({
  key,
  operator: BinaryOperator.eq,
  value: null,
});
