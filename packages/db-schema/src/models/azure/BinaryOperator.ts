export enum BinaryOperator {
  eq = "eq",
  ge = "ge",
  gt = "gt",
  le = "le",
  lt = "lt",
  ne = "ne",
}

export const BinaryOperators = new Set(Object.values(BinaryOperator));
