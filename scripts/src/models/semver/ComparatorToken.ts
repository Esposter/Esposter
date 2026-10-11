import type { RangeOperator } from "#src/models/semver/RangeOperator";

// One comparator as written, its wildcard parts kept as written too, with the build metadata dropped
export interface ComparatorToken {
  major: string;
  minor: string;
  operator: RangeOperator;
  patch: string;
  prerelease: string;
}
