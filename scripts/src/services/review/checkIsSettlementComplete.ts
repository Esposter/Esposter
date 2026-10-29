import type { ReviewSettlementDisposition } from "#src/models/review/ReviewSettlementDisposition";

// Whether a settler answered every finding of the issue, each by an index the issue holds, so no finding is left unsettled
export const checkIsSettlementComplete = (findingCount: number, dispositions: ReviewSettlementDisposition[]): boolean =>
  dispositions.every(({ index }) => index < findingCount) &&
  Array.from({ length: findingCount }, (_value, index) => index).every((index) =>
    dispositions.some((disposition) => disposition.index === index),
  );
