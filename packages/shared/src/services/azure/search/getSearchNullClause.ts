import type { Clause } from "@/models/azure/Clause";

import { BinaryOperator } from "@/models/azure/BinaryOperator";
// Azure Search actually supports null values c:
export const getSearchNullClause = (key: Clause["key"]): Clause => ({
  key,
  operator: BinaryOperator.eq,
  value: null,
});
