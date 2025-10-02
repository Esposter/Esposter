import type { SearchOperator } from "@/models/azure/SearchOperator";

import { BinaryOperator } from "@/models/azure/BinaryOperator";

export const RangeOperators: (BinaryOperator | SearchOperator)[] = [
  BinaryOperator.ge,
  BinaryOperator.gt,
  BinaryOperator.le,
  BinaryOperator.lt,
];
