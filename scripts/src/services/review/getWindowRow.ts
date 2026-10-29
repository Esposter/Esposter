import type { ReviewWindow } from "#src/models/review/ReviewWindow";

import { ReviewWindowStatus } from "#src/models/review/ReviewWindowStatus";

// One window as a row of the summary's table
export const getWindowRow = (
  { base, batches, end }: ReviewWindow,
  index: number,
  findingCount: number,
  status: ReviewWindowStatus,
): string =>
  `| ${index} | \`${base.slice(0, 12)}..${end.slice(0, 12)}\` | ${batches.length} | ${findingCount} | ${status} |`;
