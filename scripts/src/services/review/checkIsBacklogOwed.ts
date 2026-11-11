import { ReviewWindowStatus } from "#src/models/review/ReviewWindowStatus";

// Whether the run left windows for the next one, by the deadline or by the cap on windows a run reviews, and no limit or
// Failure stopped it: only then does the next run owe itself a dispatch, since a limit or a failure resumes on the next
// Push, and a rerun would meet the same one.
export const checkIsBacklogOwed = (statuses: ReviewWindowStatus[], hasWindowsPastCap: boolean): boolean =>
  (hasWindowsPastCap || statuses.includes(ReviewWindowStatus.Unreached)) &&
  !statuses.some((status) => status === ReviewWindowStatus.Limited || status === ReviewWindowStatus.Failed);
