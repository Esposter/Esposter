import type { JsonPatchOperation } from "@esposter/shared";
import type { Point, PositionedDocument, PositionedElement } from "vue-block-editor-headless";

import { getChainedOperations } from "@/services/whiteboard/edit/getChainedOperations";
import { getDuplicateElement } from "@/services/whiteboard/edit/getDuplicateElement";
import { insertPositionedElement, PositionedElementType } from "vue-block-editor-headless";

// The operations that insert a copy of each original on top of the element list, as one list, each copy under the id its original maps to and moved
// By the offset. The shape copies are inserted before the arrow copies, so an arrow copy finds the shape copy its binding names
export const getCopyOperations = (
  document: PositionedDocument,
  originals: PositionedElement[],
  originalIdCopyIdMap: Record<string, string>,
  offset: Point,
): JsonPatchOperation[] => {
  const copies = [
    ...originals.filter(({ type }) => type !== PositionedElementType.Arrow),
    ...originals.filter(({ type }) => type === PositionedElementType.Arrow),
  ].map((original) => getDuplicateElement(original, originalIdCopyIdMap, offset));
  return getChainedOperations(document, copies, (chainedDocument, copy) =>
    insertPositionedElement(chainedDocument, chainedDocument.elements.length, copy),
  );
};
