import type { ReviewFinding } from "#src/models/review/ReviewFinding";

// One batch's result: the findings its reviewer answered with, or the error that ended it
export type ReviewBatchOutcome = { error: Error } | { findings: ReviewFinding[] };
