import { RangeOperator } from "#src/models/semver/RangeOperator";

export const parseOperator = (text: string | undefined): RangeOperator => {
  switch (text) {
    case "^":
      return RangeOperator.Caret;
    case "<":
      return RangeOperator.LessThan;
    case "<=":
      return RangeOperator.LessThanOrEqual;
    case ">":
      return RangeOperator.GreaterThan;
    case ">=":
      return RangeOperator.GreaterThanOrEqual;
    case "~":
    case "~>":
      return RangeOperator.Tilde;
    default:
      return RangeOperator.Equal;
  }
};
