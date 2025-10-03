import type { Clause } from "@/models/azure/Clause";

import { BinaryOperator } from "@/models/azure/BinaryOperator";
import { Literal } from "@/models/azure/Literal";
// Equivalent to `not(${key} ne NaN)` null check in Azure Table Storage
export const getNullClause = (key: Clause["key"]): Clause => ({
  key,
  not: true,
  operator: BinaryOperator.ne,
  value: Literal.NaN,
});
