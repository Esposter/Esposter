import type { Clause } from "#src/models/shared/Clause";

import { BinaryOperator } from "#src/models/shared/BinaryOperator";

// Azure Search actually supports null values c:
export const getSearchNullClause = <T extends object>(key: keyof T & string): Clause<T> => ({
  key,
  operator: BinaryOperator.Eq,
  value: null,
});
