import type { SlotInput } from "#src/models/coderabbit/collect/SlotInput";

import { WINDOW_FILL_TARGET } from "#src/services/coderabbit/shared/constants";

// Whether the unreviewed range on `develop` is worth starting a review over. A slot costs an hour whether it
// Reads two files or ninety-nine, and the collector has two ways to spend one: pushing a window, which the bot
// Auto-reviews because the pull request's base is the default branch, and asking for the review a rate limit
// Refused. The fill target governs the first and has to govern the second, or the retrigger spends on two files
// What the push step exists to protect.
//
// Under the target while the queue still owes commits, nothing is lost by waiting: a window pushed on top of an
// Unreviewed one is read as a single range from the frontier, so the next one grows this range rather than
// Starting a second review, and the limit that skipped this one skips those pushes too. With nothing left to
// Add, the range is as big as it will ever be and the review is owed now.
export const checkIsSlotWorthSpending = ({ fileCount, isForced, isQueueOwing }: SlotInput): boolean =>
  isForced || !isQueueOwing || fileCount >= WINDOW_FILL_TARGET;
