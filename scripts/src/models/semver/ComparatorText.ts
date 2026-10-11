import type { RangeOperator } from "#src/models/semver/RangeOperator";

// A bound before its version is parsed, so a bound that is not a version is found out in one place
export interface ComparatorText {
  operator: RangeOperator;
  version: string;
}
