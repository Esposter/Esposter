import type { SlotFor } from "#src/models/shared/overlay/SlotFor";

// A version a write's response named for one row. It holds once that row is held at that version or above
export type Confirmation = (slotFor: SlotFor) => boolean;
