import { parseVersionTriple } from "#src/services/cli/run/parseVersionTriple";
// Whether `version` is >= `minimum`, compared field-by-field on the major.minor.patch triple. An unparseable
// Version (or minimum) reads as below the minimum — unknown is treated as unsupported.
export const checkIsVersionAtLeast = (version: string, minimum: string): boolean => {
  const actual = parseVersionTriple(version);
  const required = parseVersionTriple(minimum);
  if (actual === undefined || required === undefined) return false;
  const [actualMajor, actualMinor, actualPatch] = actual;
  const [minimumMajor, minimumMinor, minimumPatch] = required;
  if (actualMajor !== minimumMajor) return actualMajor > minimumMajor;
  if (actualMinor !== minimumMinor) return actualMinor > minimumMinor;
  return actualPatch >= minimumPatch;
};
