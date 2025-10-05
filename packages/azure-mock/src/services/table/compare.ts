import { BinaryOperator, InvalidOperationError, Operation } from "@esposter/shared";

export const compare = <T>(operator: BinaryOperator, leftHandSide: T, rightHandSide: null | T): boolean => {
  if (rightHandSide === null || rightHandSide === undefined) {
    if (operator !== BinaryOperator.eq)
      throw new InvalidOperationError(
        Operation.Read,
        compare.name,
        JSON.stringify({ leftHandSide, operator, rightHandSide }),
      );
    return leftHandSide === rightHandSide;
  }

  switch (operator) {
    case BinaryOperator.eq:
      return leftHandSide === rightHandSide;
    case BinaryOperator.ge:
      return leftHandSide >= rightHandSide;
    case BinaryOperator.gt:
      return leftHandSide > rightHandSide;
    case BinaryOperator.le:
      return leftHandSide <= rightHandSide;
    case BinaryOperator.lt:
      return leftHandSide < rightHandSide;
    case BinaryOperator.ne:
      return leftHandSide !== rightHandSide;
  }
};
