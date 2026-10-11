import type { RangeOperator } from "#src/models/semver/RangeOperator";
import type { Version } from "#src/models/semver/Version";

export interface Comparator {
  operator: RangeOperator;
  version: Version;
}
