import { getNodeSlotPointer } from "@/services/pageBuilder/getNodeSlotPointer";
import { getSlotOwnerPointer } from "@/services/pageBuilder/getSlotOwnerPointer";

// The slot a node sits in, then the slot holding that slot's owner, up to the root's content
export const getHoldingSlotPointers = (nodePointer: string): string[] => {
  const slotPointer = getNodeSlotPointer(nodePointer);
  if (slotPointer === "/content") return [slotPointer];

  return [slotPointer, ...getHoldingSlotPointers(getSlotOwnerPointer(slotPointer))];
};
