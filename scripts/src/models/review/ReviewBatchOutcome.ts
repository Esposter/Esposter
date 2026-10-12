import type { ReviewFinding } from "#src/models/review/ReviewFinding";

// One batch's result: the findings its reviewer answered with, the error that ended it, or the mark of a batch the run
// Deadline left unstarted, which the next run reviews
export type ReviewBatchOutcome = { error: Error } | { findings: ReviewFinding[] } | { isUnreached: true };
