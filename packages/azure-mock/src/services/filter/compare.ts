import { BinaryOperator } from "@esposter/azure";
import { exhaustiveGuard, InvalidOperationError, Operation } from "@esposter/shared";

export const compare = <T>(operator: BinaryOperator, leftHandSide: T, rightHandSide: null | T): boolean => {
  if (rightHandSide === null || rightHandSide === undefined) {
    if (operator !== BinaryOperator.Eq)
      throw new InvalidOperationError(
        Operation.Read,
        compare.name,
        JSON.stringify({ leftHandSide, operator, rightHandSide }),
      );
    // Azure Search treats a missing field as null, so undefined matches a null clause too.
    return leftHandSide === null || leftHandSide === undefined;
  }

  switch (operator) {
    case BinaryOperator.Eq:
      return leftHandSide === rightHandSide;
    case BinaryOperator.Ge:
      return leftHandSide >= rightHandSide;
    case BinaryOperator.Gt:
      return leftHandSide > rightHandSide;
    case BinaryOperator.Le:
      return leftHandSide <= rightHandSide;
    case BinaryOperator.Lt:
      return leftHandSide < rightHandSide;
    case BinaryOperator.Ne:
      return leftHandSide !== rightHandSide;
    default:
      return exhaustiveGuard(operator);
  }
};
