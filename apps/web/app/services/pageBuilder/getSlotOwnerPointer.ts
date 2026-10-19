import { parseJsonPointer, toJsonPointer } from "@esposter/shared";

// The pointer of the node whose props hold a slot, which is the slot's pointer without its last two segments
export const getSlotOwnerPointer = (slotPointer: string) => toJsonPointer(parseJsonPointer(slotPointer).slice(0, -2));
