export enum BinaryOperator {
  eq = "eq",
  ge = "ge",
  gt = "gt",
  le = "le",
  lt = "lt",
  ne = "ne",
}

export const BinaryOperators: ReadonlySet<BinaryOperator> = new Set(Object.values(BinaryOperator));
