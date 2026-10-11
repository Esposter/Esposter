import type { Version } from "#src/models/semver/Version";

const NUMERIC_IDENTIFIER_REGEX = /^\d+$/u;

// Numeric identifiers never carry a leading zero, so a longer one is the larger and equal lengths compare as text
const compareNumericIdentifiers = (first: string, second: string): number =>
  first.length - second.length || compareText(first, second);

const compareText = (first: string, second: string): number => {
  if (first < second) return -1;
  else if (first > second) return 1;
  else return 0;
};

// A numeric identifier sorts below an alphanumeric one, and two of either kind compare by their own rule
const compareIdentifiers = (first: string, second: string): number => {
  const isFirstNumeric = NUMERIC_IDENTIFIER_REGEX.test(first);
  const isSecondNumeric = NUMERIC_IDENTIFIER_REGEX.test(second);
  if (isFirstNumeric && isSecondNumeric) return compareNumericIdentifiers(first, second);
  else if (isFirstNumeric) return -1;
  else if (isSecondNumeric) return 1;
  else return compareText(first, second);
};

// A release sorts above every prerelease of its version, and a longer prerelease above a shorter one it extends
const comparePrerelease = (first: string[], second: string[]): number => {
  if (first.length === 0 || second.length === 0) return second.length - first.length;

  for (const [index, firstIdentifier] of first.entries()) {
    const secondIdentifier = second[index];
    if (secondIdentifier === undefined) return 1;

    const comparison = compareIdentifiers(firstIdentifier, secondIdentifier);
    if (comparison !== 0) return comparison;
  }

  return first.length - second.length;
};

export const compareVersions = (first: Version, second: Version): number =>
  compareNumericIdentifiers(first.major, second.major) ||
  compareNumericIdentifiers(first.minor, second.minor) ||
  compareNumericIdentifiers(first.patch, second.patch) ||
  comparePrerelease(first.prerelease, second.prerelease);
