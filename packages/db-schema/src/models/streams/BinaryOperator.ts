export enum BinaryOperator {
  Eq = "eq",
  Ge = "ge",
  Gt = "gt",
  Le = "le",
  Lt = "lt",
  Ne = "ne",
}

export const BinaryOperators: readonly BinaryOperator[] = Object.values(BinaryOperator);
