import type { Clause } from "#src/models/shared/Clause";

import { BinaryOperator } from "#src/models/shared/BinaryOperator";

// Azure Search compares a field with null directly, where Azure Table needs the NaN comparison of `getTableNullClause`
export const getSearchNullClause = <T extends object>(key: keyof T & string): Clause<T> => ({
  key,
  operator: BinaryOperator.Eq,
  value: null,
});
