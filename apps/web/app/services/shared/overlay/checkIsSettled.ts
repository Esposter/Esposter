import type { PendingEntry } from "#src/models/shared/overlay/PendingEntry";
import type { SlotFor } from "#src/models/shared/overlay/SlotFor";

// An entry drops once its write has been answered and every row the answer named is held at that version or above
export const checkIsSettled = (pendingEntry: PendingEntry, slotFor: SlotFor): boolean =>
  pendingEntry.confirmed?.every((confirmation) => confirmation(slotFor)) ?? false;
