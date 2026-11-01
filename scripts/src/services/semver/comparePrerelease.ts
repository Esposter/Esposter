import { compareIdentifiers } from "#src/services/semver/compareIdentifiers";

// A release sorts above every prerelease of its version, and a longer prerelease above a shorter one it extends
export const comparePrerelease = (first: string[], second: string[]): number => {
  if (first.length === 0 || second.length === 0) return second.length - first.length;

  for (const [index, firstIdentifier] of first.entries()) {
    const secondIdentifier = second[index];
    if (secondIdentifier === undefined) return 1;

    const comparison = compareIdentifiers(firstIdentifier, secondIdentifier);
    if (comparison !== 0) return comparison;
  }

  return first.length - second.length;
};
