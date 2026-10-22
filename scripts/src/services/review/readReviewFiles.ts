import type { ReviewFile } from "#src/models/review/ReviewFile";

import { checkIsExcludedPath } from "#src/services/review/checkIsExcludedPath";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";

// The files a range changes, with the lines and the diff characters each changed, minus the excluded paths and the binary
// Files: numstat prints `-` for both counts of a binary, which no reviewer can read as text.
export const readReviewFiles = (base: string, end: string): ReviewFile[] =>
  getNonEmptyLines(runGit(["diff", "--numstat", "--no-renames", base, end])).flatMap((line) => {
    const [added = "", deleted = "", ...pathParts] = line.split("\t");
    const path = pathParts.join("\t");
    if (added === "-" || deleted === "-" || checkIsExcludedPath(path)) return [];
    const characters = runGit(["diff", "--no-color", "--no-ext-diff", "--no-renames", base, end, "--", path]).length;
    return [{ characters, lines: Number(added) + Number(deleted), path }];
  });
