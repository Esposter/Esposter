import type { SlotFor } from "#src/models/shared/overlay/SlotFor";

// A row a write's response returned, applied through the slot of its own table. The row type stays inside the closure
export type Arrival = (slotFor: SlotFor) => void;
