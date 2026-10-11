import type { BatchReads } from "#src/models/outdatedDependencies/shared/BatchReads";

import { REGISTRY_CONCURRENCY } from "#src/services/outdatedDependencies/registry/constants";
import { getResultAsync } from "@esposter/shared";

// Each item's read, `REGISTRY_CONCURRENCY` at a time: a worker takes the next item once its own read settles, so one
// Slow request never holds the others back. A failed read is reported beside its item rather than thrown, so one
// Package's failure never hides another's result.
export const readInBatches = async <TItem, TValue>(
  items: TItem[],
  read: (item: TItem) => Promise<TValue>,
): Promise<BatchReads<TItem, TValue>> => {
  const errors = new Map<TItem, string>();
  const values = new Map<TItem, TValue>();
  let nextIndex = 0;

  const workers = Array.from({ length: REGISTRY_CONCURRENCY }, async () => {
    for (;;) {
      const item = items[nextIndex];
      if (item === undefined) return;
      nextIndex += 1;

      // oxlint-disable-next-line no-await-in-loop -- Bounded concurrency: each worker takes the next item only after its read settles
      await getResultAsync(() => read(item)).match(
        (value) => {
          values.set(item, value);
        },
        (error) => {
          errors.set(item, error.message);
        },
      );
    }
  });
  await Promise.all(workers);

  return { errors, values };
};
