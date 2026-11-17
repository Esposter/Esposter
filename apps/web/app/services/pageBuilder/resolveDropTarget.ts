import type { DropTarget } from "#src/models/pageBuilder/DropTarget";
import type { DropTargetInput } from "#src/models/pageBuilder/DropTargetInput";
import type { PageBuilderKind } from "#src/models/pageBuilder/PageBuilderKind";
import type { BlockDocument, BlockNode, BlockRootProps, BlockTypeDefinition } from "vue-block-editor-headless";

import { getCandidateSlotPointers } from "#src/services/pageBuilder/getCandidateSlotPointers";
import { getDropIndex } from "#src/services/pageBuilder/getDropIndex";
import { getDropSlotChildIds } from "#src/services/pageBuilder/getDropSlotChildIds";
import { getNodePointer } from "#src/services/pageBuilder/getNodePointer";
import { getSlotOwnerId } from "#src/services/pageBuilder/getSlotOwnerId";
import { getAcceptedTypes } from "vue-block-editor-headless";

// The slot a block dragged over a node drops into: the first candidate whose accepted types include the dragged type
// The index is the one the pointer resolves to among that slot's children, along the axis its owner lays them out on,
// And undefined when no slot accepts the type, or when the pointer is over the dragged node or a node it holds
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
    draggedNodeId,
    draggedType,
    getChildRect,
    hoveredNodeId,
    pointer,
  }: DropTargetInput<TDocument, TNode["type"]>,
): DropTarget | undefined => {
  const hoveredNodePointer = hoveredNodeId === undefined ? undefined : getNodePointer(kind, document, hoveredNodeId);
  const draggedNodePointer = draggedNodeId ? getNodePointer(kind, document, draggedNodeId) : undefined;
  if (
    hoveredNodePointer !== undefined &&
    draggedNodePointer !== undefined &&
    (hoveredNodePointer === draggedNodePointer || hoveredNodePointer.startsWith(`${draggedNodePointer}/`))
  )
    return undefined;

  const candidateSlotPointers =
    hoveredNodePointer === undefined ? ["/content"] : getCandidateSlotPointers(kind, document, hoveredNodePointer);
  const slotPointer = candidateSlotPointers.find((candidate) =>
    getAcceptedTypes(document, kind.registry, kind.children, candidate).includes(draggedType),
  );
  if (slotPointer === undefined) return undefined;

  const childRects = getDropSlotChildIds(kind, document, slotPointer, draggedNodeId).map((childId) =>
    getChildRect(childId),
  );
  const isHorizontal = checkIsHorizontalOwner(getSlotOwnerId(kind, document, slotPointer));
  return { index: getDropIndex(childRects, pointer, isHorizontal), slotPointer };
};
