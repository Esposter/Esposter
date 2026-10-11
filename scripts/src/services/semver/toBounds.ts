import type { ComparatorText } from "#src/models/semver/ComparatorText";

import { RangeOperator } from "#src/models/semver/RangeOperator";

export const toBounds = (lower: string, upper: string): ComparatorText[] => [
  { operator: RangeOperator.GreaterThanOrEqual, version: lower },
  { operator: RangeOperator.LessThan, version: upper },
];
