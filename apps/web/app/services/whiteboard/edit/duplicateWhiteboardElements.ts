import type { WhiteboardEditState } from "@/models/whiteboard/WhiteboardEditState";

import { applyWhiteboardEdit } from "@/services/whiteboard/edit/applyWhiteboardEdit";
import { getChainedOperations } from "@/services/whiteboard/edit/getChainedOperations";
import { getDuplicateElement } from "@/services/whiteboard/edit/getDuplicateElement";
import { insertPositionedElement, PositionedElementType } from "vue-block-editor-headless";

// Copies each element of a selection on top of the element list, under a new id and offset, as one edit. The shape copies are inserted before the
// Arrow copies, so an arrow copy finds the shape copy its binding names. Returns the copies' ids, which the selection moves onto
export const duplicateWhiteboardElements = (
  state: WhiteboardEditState,
  elementIds: string[],
): { copiedIds: string[]; state: WhiteboardEditState } => {
  const originals = state.document.elements.filter(({ id }) => elementIds.includes(id));
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
