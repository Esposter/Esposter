import type { Clause } from "#src/models/Clause";

import { BinaryOperator } from "#src/models/BinaryOperator";

export const getSearchNonNullClause = <T extends object>(key: keyof T & string): Clause<T> => ({
  key,
  operator: BinaryOperator.ne,
  value: null,
});
