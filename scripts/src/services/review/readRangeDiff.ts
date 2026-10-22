import { runGit } from "#src/services/shared/runGit";

// The diff of a range, or of the given paths within it, in the one form every reader of a range's diff shares
export const readRangeDiff = (base: string, end: string, paths: string[] = []): string =>
  runGit([
    "diff",
    "--no-color",
    "--no-ext-diff",
    "--no-renames",
    base,
    end,
    ...(paths.length > 0 ? ["--", ...paths] : []),
  ]);
