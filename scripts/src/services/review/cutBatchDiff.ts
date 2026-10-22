import { REVIEW_DIFF_CHARACTER_LIMIT, REVIEW_DIFF_LINE_LIMIT } from "#src/services/review/constants";

// The diff's lines joined, cut at `REVIEW_DIFF_LINE_LIMIT` lines and then at `REVIEW_DIFF_CHARACTER_LIMIT` characters, since one
// Line can be the whole of a generated file. `isDiffCut` tells the prompt that either cut was made.
export const cutBatchDiff = (lines: string[]): { diff: string; isDiffCut: boolean } => {
  const linesDiff = lines.slice(0, REVIEW_DIFF_LINE_LIMIT).join("\n");
  const diff = linesDiff.slice(0, REVIEW_DIFF_CHARACTER_LIMIT);
  return { diff, isDiffCut: lines.length > REVIEW_DIFF_LINE_LIMIT || diff.length < linesDiff.length };
};
