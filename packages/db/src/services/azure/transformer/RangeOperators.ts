import type { SearchOperator } from "@esposter/db-schema";

import { BinaryOperator } from "@esposter/db-schema";

export const RangeOperators: (BinaryOperator | SearchOperator)[] = [
  BinaryOperator.ge,
  BinaryOperator.gt,
  BinaryOperator.le,
  BinaryOperator.lt,
];
