import type { SearchOperator } from "@esposter/azure";

import { BinaryOperator } from "@esposter/azure";

export const RangeOperators: (BinaryOperator | SearchOperator)[] = [
  BinaryOperator.ge,
  BinaryOperator.gt,
  BinaryOperator.le,
  BinaryOperator.lt,
];
