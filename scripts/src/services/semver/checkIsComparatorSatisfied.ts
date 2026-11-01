import type { Comparator } from "#src/models/semver/Comparator";
import type { Version } from "#src/models/semver/Version";

import { RangeOperator } from "#src/models/semver/RangeOperator";
import { compareVersions } from "#src/services/semver/compareVersions";
import { exhaustiveGuard, InvalidOperationError, Operation } from "@esposter/shared";

export const checkIsComparatorSatisfied = (version: Version, { operator, version: bound }: Comparator): boolean => {
  const comparison = compareVersions(version, bound);
  switch (operator) {
    case RangeOperator.Equal:
      return comparison === 0;
    case RangeOperator.GreaterThan:
      return comparison > 0;
    case RangeOperator.GreaterThanOrEqual:
      return comparison >= 0;
    case RangeOperator.LessThan:
      return comparison < 0;
    case RangeOperator.LessThanOrEqual:
      return comparison <= 0;
    case RangeOperator.Caret:
    case RangeOperator.Tilde:
      // Caret and tilde are expanded into bounds before a comparator exists, so never reach here
      throw new InvalidOperationError(Operation.Read, checkIsComparatorSatisfied.name, `${operator} is not expanded`);
    default:
      return exhaustiveGuard(operator);
  }
};
