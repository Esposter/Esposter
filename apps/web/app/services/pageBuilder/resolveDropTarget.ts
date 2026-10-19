import type { DropTarget } from "@/models/pageBuilder/DropTarget";
import type { DropTargetInput } from "@/models/pageBuilder/DropTargetInput";

import { webpageRegistry } from "#shared/services/pageBuilder/webpageRegistry";
import { getCandidateSlotPointers } from "@/services/pageBuilder/getCandidateSlotPointers";
import { getDropIndex } from "@/services/pageBuilder/getDropIndex";
import { getNodePointer } from "@/services/pageBuilder/getNodePointer";
import { getSlotChildIds } from "@/services/pageBuilder/getSlotChildIds";
import { getAcceptedTypes } from "headless-block-editor";

// The slot a block dragged over a node drops into: the first candidate whose accepted types include the dragged type
// The index is the one the pointer resolves to among that slot's children, and undefined when no slot accepts the type
export const resolveDropTarget = ({
  document,
  draggedType,
  getChildRect,
  hoveredNodeId,
  pointer,
}: DropTargetInput): DropTarget | undefined => {
  const hoveredNodePointer = hoveredNodeId === undefined ? undefined : getNodePointer(document, hoveredNodeId);
  const candidateSlotPointers =
    hoveredNodePointer === undefined ? ["/content"] : getCandidateSlotPointers(document, hoveredNodePointer);
  const slotPointer = candidateSlotPointers.find((candidate) =>
    getAcceptedTypes(document, webpageRegistry, candidate).includes(draggedType),
  );
  if (slotPointer === undefined) return undefined;

  const childRects = getSlotChildIds(document, slotPointer).map((childId) => getChildRect(childId));
  return { index: getDropIndex(childRects, pointer), slotPointer };
};
