import type { Clause } from "@/models/azure/Clause";

import { BinaryOperator } from "@/models/azure/BinaryOperator";

export const getSearchNonNullClause = (key: Clause["key"]): Clause => ({
  key,
  operator: BinaryOperator.ne,
  value: null,
});
