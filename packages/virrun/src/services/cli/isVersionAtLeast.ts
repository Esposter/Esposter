// Extracts the leading major.minor.patch triple from a version string — accepts a bare "0.11.1" or a
// `bwrap --version` line ("bubblewrap 0.11.1"); null when no triple is present so a garbled `--version` reads as
// Unknown, never as satisfying the gate.
const VERSION_REGEX = /(?<major>\d+)\.(?<minor>\d+)\.(?<patch>\d+)/;

const parseVersionTriple = (version: string): [number, number, number] | null => {
  const groups = VERSION_REGEX.exec(version)?.groups;
  if (groups === undefined) return null;
  return [Number(groups.major), Number(groups.minor), Number(groups.patch)];
};
// Whether `version` is >= `minimum`, compared field-by-field on the major.minor.patch triple. An unparseable
// Version (or minimum) reads as below the minimum — unknown is treated as unsupported.
export const isVersionAtLeast = (version: string, minimum: string): boolean => {
  const actual = parseVersionTriple(version);
  const required = parseVersionTriple(minimum);
  if (actual === null || required === null) return false;
  const [actualMajor, actualMinor, actualPatch] = actual;
  const [minimumMajor, minimumMinor, minimumPatch] = required;
  if (actualMajor !== minimumMajor) return actualMajor > minimumMajor;
  else if (actualMinor !== minimumMinor) return actualMinor > minimumMinor;
  else return actualPatch >= minimumPatch;
};
