import type { AnyPageBuilderDocument } from "@/models/pageBuilder/AnyPageBuilderDocument";
import type { AnyPageBuilderKind } from "@/models/pageBuilder/AnyPageBuilderKind";
import type { DropTarget } from "@/models/pageBuilder/DropTarget";
import type { BlockNode } from "headless-block-editor";

import { applyPatches, getResult } from "@esposter/shared";
import { insertBlockNode } from "headless-block-editor";

// The id the dragged block is drawn under. No document holds it, so the canvas can tell the preview from a node it holds
export const DRAG_PREVIEW_NODE_ID = "drag-preview";

// The document with a palette block being dragged inserted at the slot and index it would land in, as a preview only. The
// Input is never changed and the store never holds the result. applyPatches copies just the path down to the slot and shares
// Every other subtree, so no document is cloned per pointer move. A slot that refuses the type, or an insert that cannot
// Apply, gives the input back unchanged
export const withDragPreview = <TDocument extends AnyPageBuilderDocument>(
  kind: AnyPageBuilderKind,
  document: TDocument,
  draggedType: BlockNode["type"],
  dropTarget: DropTarget,
): TDocument => {
  const operations = insertBlockNode(
    document,
    kind.registry,
    kind.children,
    dropTarget.slotPointer,
    dropTarget.index,
    kind.createNode(draggedType, DRAG_PREVIEW_NODE_ID),
  );
  if (operations.length === 0) return document;

  return getResult(() => applyPatches(document, operations)).match(
    ({ document: previewDocument }) => previewDocument,
    () => document,
  );
};
