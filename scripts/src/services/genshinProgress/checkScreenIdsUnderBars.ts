import type { ParityApproval } from "#src/models/genshinParity/shared/ParityApproval";
import type { GenshinExitCheck } from "#src/models/genshinProgress/GenshinExitCheck";

import { ParityApprovalMeasure } from "#src/models/genshinParity/reference/ParityApprovalMeasure";
import { GenshinExitCheckState } from "#src/models/genshinProgress/GenshinExitCheckState";

// A screen is done when every parity id its page names scores under its bar: the bar its reference records, or else the
// Default. An id with no committed score, or no reference at all, is not under its bar, and a score at its bar is not
// Under it. A bar set on a measure the report's means do not carry is not measurable here
export const checkScreenIdsUnderBars = (
  folder: string,
  parityIds: readonly string[],
  means: ReadonlyMap<string, number>,
  approvals: ReadonlyMap<string, ParityApproval>,
): GenshinExitCheck => {
  const name = `screen ${folder}: every parity id under its bar`;
  if (parityIds.length === 0)
    return { name, notes: ["its page names no parity id"], state: GenshinExitCheckState.NotMeasurable };
  const failing: string[] = [];
  const unmeasured: string[] = [];
  for (const id of parityIds) {
    const approval = approvals.get(id);
    const mean = means.get(id);
    if (approval === undefined) failing.push(`${id} is not a reference in ParityReferenceMap`);
    else if (approval.measure !== ParityApprovalMeasure.MeanDifference)
      unmeasured.push(`${id} is set on ${approval.measure}, which the report's means do not read`);
    else if (mean === undefined) failing.push(`${id} has no committed score`);
    else if (mean >= approval.bar) failing.push(`${id} scores ${mean}%, not under its ${approval.bar}% bar`);
  }
  if (failing.length > 0) return { name, notes: failing, state: GenshinExitCheckState.NotMet };
  if (unmeasured.length > 0) return { name, notes: unmeasured, state: GenshinExitCheckState.NotMeasurable };
  return { name, notes: [], state: GenshinExitCheckState.Met };
};
