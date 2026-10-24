import type { DropTarget } from "@/models/pageBuilder/DropTarget";
import type { DropTargetInput } from "@/models/pageBuilder/DropTargetInput";
import type { PageBuilderKind } from "@/models/pageBuilder/PageBuilderKind";
import type { BlockDocument, BlockNode, BlockRootProps, BlockTypeDefinition } from "headless-block-editor";

import { getCandidateSlotPointers } from "@/services/pageBuilder/getCandidateSlotPointers";
import { getDropIndex } from "@/services/pageBuilder/getDropIndex";
import { getNodePointer } from "@/services/pageBuilder/getNodePointer";
import { getSlotChildIds } from "@/services/pageBuilder/getSlotChildIds";
import { getSlotOwnerId } from "@/services/pageBuilder/getSlotOwnerId";
import { getAcceptedTypes } from "headless-block-editor";

// The slot a block dragged over a node drops into: the first candidate whose accepted types include the dragged type
// The index is the one the pointer resolves to among that slot's children, along the axis its owner lays them out on,
// And undefined when no slot accepts the type
export const resolveDropTarget = <
  TNode extends BlockNode,
  TRoot extends BlockRootProps,
  TDefinition extends BlockTypeDefinition<TNode>,
  TDocument extends BlockDocument<TNode, TRoot>,
>(
  kind: PageBuilderKind<TNode, TRoot, TDefinition, TDocument>,
  {
    checkIsHorizontalOwner,
    document,
    draggedType,
    getChildRect,
    hoveredNodeId,
    pointer,
  }: DropTargetInput<TDocument, TNode["type"]>,
): DropTarget | undefined => {
  const hoveredNodePointer = hoveredNodeId === undefined ? undefined : getNodePointer(kind, document, hoveredNodeId);
  const candidateSlotPointers =
    hoveredNodePointer === undefined ? ["/content"] : getCandidateSlotPointers(kind, document, hoveredNodePointer);
  const slotPointer = candidateSlotPointers.find((candidate) =>
    getAcceptedTypes(document, kind.registry, kind.children, candidate).includes(draggedType),
  );
  if (slotPointer === undefined) return undefined;

  const childRects = getSlotChildIds(kind, document, slotPointer).map((childId) => getChildRect(childId));
  const isHorizontal = checkIsHorizontalOwner(getSlotOwnerId(kind, document, slotPointer));
  return { index: getDropIndex(childRects, pointer, isHorizontal), slotPointer };
};
