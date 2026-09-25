import type { SearchOperator } from "#src/models/search/SearchOperator";

import { BinaryOperator } from "#src/models/shared/BinaryOperator";

export const RangeOperators: (BinaryOperator | SearchOperator)[] = [
  BinaryOperator.Ge,
  BinaryOperator.Gt,
  BinaryOperator.Le,
  BinaryOperator.Lt,
];
