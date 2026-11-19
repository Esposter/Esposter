import type { ErasedSlot } from "#src/models/shared/overlay/ErasedSlot";
import type { SlotFor } from "#src/models/shared/overlay/SlotFor";

import { checkIsSlotOf } from "#src/services/shared/overlay/checkIsSlotOf";
import { createSlot } from "#src/services/shared/overlay/createSlot";

// One slot per table name, created on first use and recovered as the table it was created from
export const createSlotFor = (): SlotFor => {
  const slots = new Map<string, ErasedSlot>();
  return (table) => {
    const cachedSlot = slots.get(table.name);
    if (cachedSlot && checkIsSlotOf(table, cachedSlot)) return cachedSlot;

    const slot = createSlot(table);
    slots.set(table.name, slot);
    return slot;
  };
};
