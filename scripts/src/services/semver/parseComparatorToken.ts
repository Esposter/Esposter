import type { ComparatorToken } from "#src/models/semver/ComparatorToken";

import { RangeOperator } from "#src/models/semver/RangeOperator";
import { checkIsAnyPart } from "#src/services/semver/checkIsAnyPart";

// One comparator as written: an optional operator, then a version whose parts may be wildcards
const COMPARATOR_TOKEN_REGEX =
  /^(?<operator><=|>=|<|>|=|~>?|\^)?v?=?(?<major>0|[1-9]\d*|[*xX])(?:\.(?<minor>0|[1-9]\d*|[*xX])(?:\.(?<patch>0|[1-9]\d*|[*xX])(?<prerelease>-[\dA-Za-z.-]+)?)?)?(?:\+[\dA-Za-z.-]+)?$/u;

const parseOperator = (text: string | undefined): RangeOperator => {
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

export const parseComparatorToken = (text: string): ComparatorToken | undefined => {
  const groups = COMPARATOR_TOKEN_REGEX.exec(text)?.groups;
  if (!groups?.major) return undefined;

  const operator = parseOperator(groups.operator);
  const parts = [groups.major, groups.minor || "", groups.patch || ""];
  // Once a part is a wildcard every part after it is one too, so `1.x.5` is not a plain range; a caret or tilde reads
  // Its wildcard as the bound it spans and takes `^1.x.5` as `^1.x`
  const firstWildcardIndex = parts.findIndex((part) => checkIsAnyPart(part));
  const isTailBroken =
    firstWildcardIndex !== -1 && !parts.slice(firstWildcardIndex).every((part) => checkIsAnyPart(part));
  if (isTailBroken && operator !== RangeOperator.Caret && operator !== RangeOperator.Tilde) return undefined;

  return {
    major: groups.major,
    minor: groups.minor || "",
    operator,
    patch: groups.patch || "",
    prerelease: groups.prerelease || "",
  };
};
