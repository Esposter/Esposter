import type { Entry } from "#src/models/shared/overlay/Entry";

// A write the screen shows when it is sent. It names its entry and nothing else that orders it: the queue key comes
// From the entry, and a rollback is not a member, since a dropped entry restores nothing
export interface OptimisticWriteOptions {
  entry: Entry;
  onError: (error: Error) => void;
}
