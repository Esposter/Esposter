import type { ParityApprovalMeasure } from "#src/models/genshinParity/reference/ParityApprovalMeasure";

// The measure a screen's compare is set against and the bar it must score under to be within it, in that measure's own
// Unit: a mean difference is a percentage, as `compare` prints it
export interface ParityApproval {
  bar: number;
  measure: ParityApprovalMeasure;
}
