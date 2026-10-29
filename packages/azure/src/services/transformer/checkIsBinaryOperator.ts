import type { BinaryOperator } from "#src/models/shared/BinaryOperator";

import { BinaryOperators } from "#src/models/shared/BinaryOperator";

export const checkIsBinaryOperator = (value: string): value is BinaryOperator =>
  BinaryOperators.some((binaryOperator) => binaryOperator === value);
