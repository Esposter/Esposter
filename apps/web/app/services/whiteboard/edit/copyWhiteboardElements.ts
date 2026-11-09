import type { WhiteboardEditState } from "@/models/whiteboard/WhiteboardEditState";
import type { PositionedElement } from "vue-block-editor-headless";

import { applyWhiteboardEdit } from "@/services/whiteboard/edit/applyWhiteboardEdit";
import { getChainedOperations } from "@/services/whiteboard/edit/getChainedOperations";
import { getDuplicateElement } from "@/services/whiteboard/edit/getDuplicateElement";
import { insertPositionedElement, PositionedElementType } from "vue-block-editor-headless";

// Inserts a copy of each original on top of the element list under a new id, offset by the duplicate offset, as one edit. The shape
// Copies are inserted before the arrow copies, so an arrow copy finds the shape copy its binding names. Returns the copies' ids, which
// The selection moves onto. The originals may come from the document or from the clipboard, so an arrow's binding follows only a shape
// That is among them
export const copyWhiteboardElements = (
  state: WhiteboardEditState,
  originals: PositionedElement[],
): { copiedIds: string[]; state: WhiteboardEditState } => {
  const originalIdCopyIdMap: Record<string, string> = Object.fromEntries(
    originals.map(({ id }): [string, string] => [id, crypto.randomUUID()]),
  );
  const copies = [
    ...originals.filter(({ type }) => type !== PositionedElementType.Arrow),
    ...originals.filter(({ type }) => type === PositionedElementType.Arrow),
  ].map((original) => getDuplicateElement(original, originalIdCopyIdMap));
  const operations = getChainedOperations(state.document, copies, (document, copy) =>
    insertPositionedElement(document, document.elements.length, copy),
  );

  return { copiedIds: copies.map(({ id }) => id), state: applyWhiteboardEdit(state, operations) };
};
