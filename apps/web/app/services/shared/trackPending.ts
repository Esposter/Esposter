import type { Promisable } from "type-fest";

import { withFinalizerAsync } from "@esposter/shared";

// Holds a write in a pending count from the moment it starts until it settles. The count is released in the finalizer, so
// A write that is refused releases it too, and no call site can raise the count and forget to lower it
export const trackPending = <T>(pendingCount: Ref<number>, run: () => Promisable<T>) => {
  pendingCount.value++;
  return withFinalizerAsync(run, () => {
    pendingCount.value--;
  });
};
