import type { Clause } from "@esposter/azure";

import { BinaryOperator } from "@esposter/azure";

export const getSearchNonNullClause = <T extends object>(key: keyof T & string): Clause<T> => ({
  key,
  operator: BinaryOperator.ne,
  value: null,
});
