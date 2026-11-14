import type { SearchOperator } from "#src/models/search/SearchOperator";

import { BinaryOperator } from "@esposter/db-schema";

export const RangeOperators: (BinaryOperator | SearchOperator)[] = [
  BinaryOperator.Ge,
  BinaryOperator.Gt,
  BinaryOperator.Le,
  BinaryOperator.Lt,
];
