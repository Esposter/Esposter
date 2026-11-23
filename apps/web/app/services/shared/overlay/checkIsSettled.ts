import type { PendingEntry } from "#src/models/shared/overlay/PendingEntry";
import type { SlotFor } from "#src/models/shared/overlay/SlotFor";

// An entry drops once its write has been answered and every row the answer named is held at that version or above. An
// Answer that names no row confirms nothing, so the entry drops with the answer: a write past the header's row cap
// Names none, And its rows come back through the topic refetch its publish wakes, not through a version this entry
// Waits for
export const checkIsSettled = (pendingEntry: PendingEntry, slotFor: SlotFor): boolean =>
  pendingEntry.confirmed?.every((confirmation) => confirmation(slotFor)) ?? false;
