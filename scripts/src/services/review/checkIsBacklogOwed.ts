import { ReviewWindowStatus } from "#src/models/review/ReviewWindowStatus";

// Whether the run left windows for the deadline, and no limit or failure stopped it: only then does the next run owe
// Itself a dispatch, since a limit or a failure resumes on the next push, and a rerun would meet the same one.
export const checkIsBacklogOwed = (statuses: ReviewWindowStatus[]): boolean =>
  statuses.includes(ReviewWindowStatus.Unreached) &&
  !statuses.some((status) => status === ReviewWindowStatus.Limited || status === ReviewWindowStatus.Failed);
