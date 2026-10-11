import type { ParityApprovalMeasure } from "#src/models/genshinParity/reference/ParityApprovalMeasure";

// The measure a screen's image is approved by and the bar its compare must score under, in that measure's own unit: a
// Mean difference is a percentage, as `compare` prints it
export interface ParityApproval {
  bar: number;
  measure: ParityApprovalMeasure;
}
