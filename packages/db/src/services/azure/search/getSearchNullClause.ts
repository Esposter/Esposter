import type { Clause } from "@esposter/db-schema";

import { BinaryOperator } from "@esposter/db-schema";
// Azure Search actually supports null values c:
export const getSearchNullClause = (key: Clause["key"]): Clause => ({
  key,
  operator: BinaryOperator.eq,
  value: null,
});
