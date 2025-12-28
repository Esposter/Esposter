import type { Clause } from "@esposter/db-schema";

import { BinaryOperator } from "@esposter/db-schema";

export const getSearchNonNullClause = (key: Clause["key"]): Clause => ({
  key,
  operator: BinaryOperator.ne,
  value: null,
});
