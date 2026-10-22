import type { ReviewFile } from "#src/models/review/ReviewFile";

import { checkIsExcludedPath } from "#src/services/review/checkIsExcludedPath";
import { checkIsUnreadableDiff } from "#src/services/review/checkIsUnreadableDiff";
import { readRangeDiff } from "#src/services/review/readRangeDiff";
import { splitRangeDiff } from "#src/services/review/splitRangeDiff";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";
import { takeOne } from "@esposter/shared";

// The files a range changes, with the lines and the diff characters each changed, minus the excluded paths, the binary files
// And the files no reviewer can read as text. Numstat prints `-` for both counts of a binary. Numstat and the range's diff
// List the files in the same order, so the diff at a numstat row's index is that row's file.
export const readReviewFiles = (base: string, end: string): ReviewFile[] => {
  const diffs = splitRangeDiff(readRangeDiff(base, end));
  return getNonEmptyLines(runGit(["diff", "--numstat", "--no-renames", base, end])).flatMap((line, index) => {
    const [added = "", deleted = "", ...pathParts] = line.split("\t");
    const path = pathParts.join("\t");
    if (added === "-" || deleted === "-" || checkIsExcludedPath(path)) return [];
    const diff = takeOne(diffs, index);
    if (checkIsUnreadableDiff(diff)) return [];
    return [{ characters: diff.length, lines: Number(added) + Number(deleted), path }];
  });
};
