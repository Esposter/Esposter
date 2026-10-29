// The export lines the generator would write that the committed barrel lacks, and the committed lines it would not write
export const getBarrelDifference = (
  expectedLines: string[],
  committedLines: string[],
): { extra: string[]; missing: string[] } => ({
  extra: committedLines.filter((line) => !expectedLines.includes(line)),
  missing: expectedLines.filter((line) => !committedLines.includes(line)),
});
