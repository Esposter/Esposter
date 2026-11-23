import { readGitChangedPaths } from "#src/services/sweeps/ledgerCoverage/readGitChangedPaths";

// Every repository path a revision range changes, a deleted one included
export const readRangeChangedPaths = (range: string): string[] => readGitChangedPaths(["diff", range]);
