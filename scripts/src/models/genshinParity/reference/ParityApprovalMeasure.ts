// The score a screen's compare is set against its bar by: its FLIP, or its mean difference over the compared region in percent
export const ParityApprovalMeasure = { Flip: "FLIP", MeanDifference: "mean difference" } as const;
export type ParityApprovalMeasure = (typeof ParityApprovalMeasure)[keyof typeof ParityApprovalMeasure];
