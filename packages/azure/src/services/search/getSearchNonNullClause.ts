import type { Clause } from "#src/models/shared/Clause";

import { BinaryOperator } from "#src/models/shared/BinaryOperator";

export const getSearchNonNullClause = <T extends object>(key: keyof T & string): Clause<T> => ({
  key,
  operator: BinaryOperator.Ne,
  value: null,
});
