import type { WhiteboardEditState } from "@/models/whiteboard/WhiteboardEditState";
import type { PositionedElement } from "vue-block-editor-headless";

import { applyWhiteboardEdit } from "@/services/whiteboard/edit/applyWhiteboardEdit";
import { WHITEBOARD_DUPLICATE_OFFSET } from "@/services/whiteboard/edit/constants";
import { getCopyOperations } from "@/services/whiteboard/edit/getCopyOperations";
import { takeOne } from "@esposter/shared";

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
  const operations = getCopyOperations(state.document, originals, originalIdCopyIdMap, {
    x: WHITEBOARD_DUPLICATE_OFFSET,
    y: WHITEBOARD_DUPLICATE_OFFSET,
  });

  return {
    copiedIds: originals.map(({ id }) => takeOne(originalIdCopyIdMap, id)),
    state: applyWhiteboardEdit(state, operations),
  };
};
