import { REVIEW_DIFF_LINE_LIMIT } from "#src/services/review/constants";
import { runGit } from "#src/services/shared/runGit";

// The diff of a batch's paths over the range, cut at `REVIEW_DIFF_LINE_LIMIT` lines. `isDiffCut` tells the prompt to say so.
export const readBatchDiff = (base: string, end: string, paths: string[]): { diff: string; isDiffCut: boolean } => {
  const lines = runGit(["diff", "--no-color", "--no-ext-diff", "--no-renames", base, end, "--", ...paths]).split("\n");
  return { diff: lines.slice(0, REVIEW_DIFF_LINE_LIMIT).join("\n"), isDiffCut: lines.length > REVIEW_DIFF_LINE_LIMIT };
};
