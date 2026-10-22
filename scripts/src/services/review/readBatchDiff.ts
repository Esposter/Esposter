import { cutBatchDiff } from "#src/services/review/cutBatchDiff";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";

// The diff of a batch's paths over the range, cut by lines and by characters. `isDiffCut` tells the prompt to say so.
export const readBatchDiff = (base: string, end: string, paths: string[]): { diff: string; isDiffCut: boolean } =>
  cutBatchDiff(
    getNonEmptyLines(runGit(["diff", "--no-color", "--no-ext-diff", "--no-renames", base, end, "--", ...paths])),
  );
