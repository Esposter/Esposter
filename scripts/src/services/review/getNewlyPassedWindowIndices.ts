import { ReviewWindowStatus } from "#src/models/review/ReviewWindowStatus";

// The windows that joined the passed prefix since `handledCount` windows were handled: from that index on, each window
// That passed, up to the first that has not settled or did not pass. The windows come back in order, so the run acts on
// Them in order.
export const getNewlyPassedWindowIndices = (
  statuses: (ReviewWindowStatus | undefined)[],
  handledCount: number,
): number[] => {
  const indices: number[] = [];
  for (let index = handledCount; index < statuses.length; index += 1) {
    if (statuses[index] !== ReviewWindowStatus.Passed) break;

    indices.push(index);
  }
  return indices;
};
