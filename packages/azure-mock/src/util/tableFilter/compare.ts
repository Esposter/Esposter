import { BinaryOperator, exhaustiveGuard } from "@esposter/shared";

export const compare = (operator: BinaryOperator, leftHandSide: string, rightHandSide: string): boolean => {
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
    default:
      exhaustiveGuard(operator);
  }
};
