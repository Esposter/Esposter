export enum BinaryOperator {
  eq = "eq",
  ge = "ge",
  gt = "gt",
  le = "le",
  lt = "lt",
  ne = "ne",
}

export const BinaryOperators: readonly BinaryOperator[] = Object.values(BinaryOperator);
