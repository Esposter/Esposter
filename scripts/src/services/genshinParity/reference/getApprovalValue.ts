import type { ParityScore } from "#src/models/genshinParity/reference/ParityScore";
import type { ParityApproval } from "#src/models/genshinParity/shared/ParityApproval";

import { ParityApprovalMeasure } from "#src/models/genshinParity/reference/ParityApprovalMeasure";

// The value a compare is judged by: its FLIP or its mean difference, on the measure the screen records
export const getApprovalValue = (score: ParityScore, approval: ParityApproval): number =>
  approval.measure === ParityApprovalMeasure.Flip ? score.flip : score.meanDifference;
