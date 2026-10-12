import { ReviewWindowStatus } from "#src/models/review/ReviewWindowStatus";

// The passed windows the run may advance `main` through: the windows from the first one, up to the first that did not
// Pass. A window after a limited or failed one never passes, since its base is an end that did not land.
export const getPassedWindowCount = (statuses: ReviewWindowStatus[]): number => {
  const blockedIndex = statuses.findIndex((status) => status !== ReviewWindowStatus.Passed);
  return blockedIndex === -1 ? statuses.length : blockedIndex;
};
