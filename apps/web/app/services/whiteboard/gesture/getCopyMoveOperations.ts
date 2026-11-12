import type { JsonPatchOperation } from "@esposter/shared";
import type { Point, PositionedDocument } from "vue-block-editor-headless";

import { getCopyOperations } from "@/services/whiteboard/edit/getCopyOperations";
import { getMoveOperations } from "@/services/whiteboard/gesture/getMoveOperations";
import { applyPatches } from "@esposter/shared";

// The operations of an Alt drag: the copies of the selection inserted at their originals, then each copy moved by the pointer's delta. The copies
// And their move are one list, so a release commits them as one edit that one undo removes
export const getCopyMoveOperations = (
  document: PositionedDocument,
  originalIdCopyIdMap: Record<string, string>,
  delta: Point,
): JsonPatchOperation[] => {
  const originals = document.elements.filter(({ id }) => Object.hasOwn(originalIdCopyIdMap, id));
  const copyOperations = getCopyOperations(document, originals, originalIdCopyIdMap, { x: 0, y: 0 });
  const copiedDocument = applyPatches(document, copyOperations).document;
  return [...copyOperations, ...getMoveOperations(copiedDocument, Object.values(originalIdCopyIdMap), delta)];
};
