// The confidence a decision that writes outside the checkout needs — a push, a merge, a label on an issue.
// The cost of being wrong there is not a retry, so the band between this and its complement escalates.
export const HIGH_STAKES_CONFIDENCE = 0.85;
