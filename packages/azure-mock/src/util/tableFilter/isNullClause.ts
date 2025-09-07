import type { Clause } from "@/models/tableFilter/Clause";

import { BinaryOperator, Literal } from "@esposter/shared";
// Equivalent to `not(${key} ne NaN)` null check in Azure Table Storage
export const isNullClause = ({ not, operator, value }: Clause): boolean =>
  Boolean(not) && operator === BinaryOperator.ne && value === Literal.NaN;
