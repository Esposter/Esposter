import type { Clause } from "@esposter/db-schema";

import { BinaryOperator } from "@esposter/db-schema";

export const getSearchNonNullClause = <T extends object>(key: keyof T & string): Clause<T> => ({
  key,
  operator: BinaryOperator.ne,
  value: null,
});
