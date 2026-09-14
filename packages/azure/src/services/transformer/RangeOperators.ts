import type { SearchOperator } from "#src/models/search/SearchOperator";

import { BinaryOperator } from "#src/models/shared/BinaryOperator";

export const RangeOperators: (BinaryOperator | SearchOperator)[] = [
  BinaryOperator.ge,
  BinaryOperator.gt,
  BinaryOperator.le,
  BinaryOperator.lt,
];
