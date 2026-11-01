import { RangeOperator } from "#src/models/semver/RangeOperator";

export const parseOperator = (text: string | undefined): RangeOperator => {
  switch (text) {
    case "<":
      return RangeOperator.LessThan;
    case "<=":
      return RangeOperator.LessThanOrEqual;
    case ">":
      return RangeOperator.GreaterThan;
    case ">=":
      return RangeOperator.GreaterThanOrEqual;
    case "^":
      return RangeOperator.Caret;
    case "~":
    case "~>":
      return RangeOperator.Tilde;
    default:
      return RangeOperator.Equal;
  }
};
