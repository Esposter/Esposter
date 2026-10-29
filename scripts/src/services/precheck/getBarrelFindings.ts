import { getBarrelDifference } from "#src/services/precheck/getBarrelDifference";

// The findings one barrel raises: each line its generator would write that the committed barrel lacks, and each committed
// Line it would not write
export const getBarrelFindings = (barrelLabel: string, expectedLines: string[], committedLines: string[]): string[] => {
  const { extra, missing } = getBarrelDifference(expectedLines, committedLines);
  return [
    ...missing.map((line) => `${barrelLabel} missing ${line}`),
    ...extra.map((line) => `${barrelLabel} extra ${line}`),
  ];
};
