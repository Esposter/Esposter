import type { Clause } from "@/models/azure/Clause";

import { BinaryOperator } from "@/models/azure/BinaryOperator";
import { Literal } from "@/models/azure/Literal";

export const getNonNullClause = (key: Clause["key"]): Clause => ({
  key,
  operator: BinaryOperator.ne,
  value: Literal.Null,
});
