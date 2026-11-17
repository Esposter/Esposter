import type { PageBuilderHelper } from "#src/models/pageBuilder/PageBuilderHelper";

import { getSlotChildIds } from "#src/services/pageBuilder/getSlotChildIds";

// The children of a slot a drop lands among. A node a handle is moving leaves its own slot's children, so an index counts the
// Slot as it stands once that node is removed, as the move that lands it does
export const getDropSlotChildIds: PageBuilderHelper<
  string[],
  [slotPointer: string, draggedNodeId: string | undefined]
> = (kind, document, slotPointer, draggedNodeId) =>
  getSlotChildIds(kind, document, slotPointer).filter((childId) => childId !== draggedNodeId);
