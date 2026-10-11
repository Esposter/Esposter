import type { ComparatorText } from "#src/models/semver/ComparatorText";

import { RangeOperator } from "#src/models/semver/RangeOperator";

// The bound an empty set, `*` and `x` all expand to: every version
export const ANY_COMPARATOR_TEXT: ComparatorText = { operator: RangeOperator.GreaterThanOrEqual, version: "0.0.0" };
