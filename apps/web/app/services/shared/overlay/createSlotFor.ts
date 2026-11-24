import type { ErasedSlot } from "#src/models/shared/overlay/ErasedSlot";
import type { HeldTables } from "#src/models/shared/overlay/HeldTables";
import type { SlotFor } from "#src/models/shared/overlay/SlotFor";

import { checkIsSlotOf } from "#src/services/shared/overlay/checkIsSlotOf";
import { createSlot } from "#src/services/shared/overlay/createSlot";

// One slot per table source, created on first use and recovered as the table it was created from. A name is not the
// Key: two tables in a schema share a name only by error, and a slot keyed by one would be overwritten by the other.
// The slots hold their rows in the held tables the caller passes, so the store that owns that state owns the rows
export const createSlotFor = (heldTables: { value: HeldTables }): SlotFor => {
  const slots = new WeakMap<object, ErasedSlot>();
  return (table) => {
    const cachedSlot = slots.get(table.source);
    if (cachedSlot && checkIsSlotOf(table, cachedSlot)) return cachedSlot;

    const slot = createSlot(table, heldTables);
    slots.set(table.source, slot);
    return slot;
  };
};
