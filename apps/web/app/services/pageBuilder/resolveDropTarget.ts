import type { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import type { BlockDocument } from "headless-block-editor";

import { webpageRegistry } from "#shared/services/pageBuilder/webpageRegistry";
import { checkIsHorizontalSlot } from "@/services/pageBuilder/checkIsHorizontalSlot";
import { getNodeSlotPointer } from "@/services/pageBuilder/getNodeSlotPointer";
import { getNodePointer } from "@/services/pageBuilder/getNodePointer";
import { getSlotChildIds } from "@/services/pageBuilder/getSlotChildIds";
import { getSlotOwnerPointer } from "@/services/pageBuilder/getSlotOwnerPointer";
import { getAcceptedTypes, getBlockNode, getBlockPropPointer, getBlockTypeDefinition } from "headless-block-editor";

export interface DropTarget {
  index: number;
  slotPointer: string;
}

export interface DropTargetInput {
  document: BlockDocument;
  draggedType: WebpageNodeType;
  getChildRect: (nodeId: string) => ChildRect | undefined;
  hoveredNodeId: string | undefined;
  pointer: { x: number; y: number };
}

interface ChildRect {
  height: number;
  left: number;
  top: number;
  width: number;
}

// The pointers of the slots a node holds its own children in, then the slot holding the node and each ancestor's slot in turn
const getCandidateSlotPointers = (document: BlockDocument, nodePointer: string): string[] => {
  const node = getBlockNode(document, nodePointer);
  const ownSlotPointers = Object.keys(getBlockTypeDefinition(webpageRegistry, node?.type ?? "")?.slots ?? {}).map(
    (slot) => getBlockPropPointer(nodePointer, slot),
  );
  return [...ownSlotPointers, ...getHoldingSlotPointers(nodePointer)];
};

// The slot a node sits in, then the slot holding that slot's owner, up to the root's content
const getHoldingSlotPointers = (nodePointer: string): string[] => {
  const slotPointer = getNodeSlotPointer(nodePointer);
  if (slotPointer === "/content") return [slotPointer];

  return [slotPointer, ...getHoldingSlotPointers(getSlotOwnerPointer(slotPointer))];
};

// The index a drop inserts at: the first child whose midpoint along the slot's axis the pointer has not crossed
const getDropIndex = (childRects: (ChildRect | undefined)[], pointer: { x: number; y: number }): number => {
  const isHorizontal = checkIsHorizontalSlot(childRects);
  const index = childRects.findIndex((rect) => {
    if (!rect) return false;

    return isHorizontal ? pointer.x < rect.left + rect.width / 2 : pointer.y < rect.top + rect.height / 2;
  });
  return index === -1 ? childRects.length : index;
};

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
