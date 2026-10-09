import { ComparisonFailureRecovery } from "#src/models/genshinParity/reference/ComparisonFailureRecovery";

// The messages Playwright throws once a page, its context or its browser has closed or crashed under a call
const CLOSED_TARGET_REGEX = /has been closed|Target closed|Target crashed|Session closed/u;

// A comparison that failed on a closed or crashed target is relaunched for the next reference; any other failure is
// The reference's own, and the browser it ran in is kept
export const classifyComparisonFailure = (message: string): ComparisonFailureRecovery =>
  CLOSED_TARGET_REGEX.test(message)
    ? ComparisonFailureRecovery.RelaunchAndContinue
    : ComparisonFailureRecovery.MissingInput;
