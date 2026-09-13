import { RATE_LIMITED_DESCRIPTION } from "#src/services/coderabbit/collect/constants";

// Every probe reply carries the same note — CodeRabbit "does not re-review already reviewed commits" — and the
// Reply announcing a review it has just started carries it too, so a reply read for those words reports that
// The head is reviewed whatever happened and the collector pushes straight into the review it triggered. The
// Status line is what decides, and the only one that leaves the slot free is the rate limit: the bot ran
// Nothing, the frontier has not moved, and a window measured from that stale frontier can only over-count,
// Which is the safe direction. Every other reply — the review that started, a closed pull request, a status
// Nobody has seen before — leaves the slot spoken for, and the run exits for that review's completion to
// Re-fire it.
export const checkIsSlotFree = (reply: string): boolean => reply.includes(RATE_LIMITED_DESCRIPTION);
