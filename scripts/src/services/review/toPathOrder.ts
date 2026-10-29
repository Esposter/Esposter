import type { ReviewFile } from "#src/models/review/ReviewFile";

// Path order, by code unit, so the same range always packs the same batches on any machine
export const toPathOrder = (left: ReviewFile, right: ReviewFile): number => {
  if (left.path === right.path) return 0;
  return left.path < right.path ? -1 : 1;
};
