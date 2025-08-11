import type { ComparisonOperator } from "@/models/tableFilter/ComparisonOperator";

export const compare = (operator: ComparisonOperator, leftHandSide: string, rightHandSide: string): boolean => {
  switch (operator) {
    case "eq":
      return leftHandSide === rightHandSide;
    case "ge":
      return leftHandSide >= rightHandSide;
    case "gt":
      return leftHandSide > rightHandSide;
    case "le":
      return leftHandSide <= rightHandSide;
    case "lt":
      return leftHandSide < rightHandSide;
  }
};
