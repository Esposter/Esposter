import { cutBatchDiff } from "#src/services/review/cutBatchDiff";
import { readRangeDiff } from "#src/services/review/readRangeDiff";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";

// The diff of a batch's paths over the range, cut by lines and by characters. `isDiffCut` tells the prompt to say so.
export const readBatchDiff = (base: string, end: string, paths: string[]): { diff: string; isDiffCut: boolean } =>
  cutBatchDiff(getNonEmptyLines(readRangeDiff(base, end, paths)));
