import type { WhiteboardEditState } from "@/models/whiteboard/WhiteboardEditState";

import { applyWhiteboardEdit } from "@/services/whiteboard/edit/applyWhiteboardEdit";
import { getChainedOperations } from "@/services/whiteboard/edit/getChainedOperations";
import { getElementIndexById } from "@/services/whiteboard/gesture/getElementIndexById";
import { deletePositionedElement } from "vue-block-editor-headless";

// Deletes each element of a selection as one edit. A shape takes the arrows bound only to it, and an element an earlier delete already took is skipped
export const deleteWhiteboardElements = (state: WhiteboardEditState, elementIds: string[]): WhiteboardEditState =>
  applyWhiteboardEdit(
    state,
    getChainedOperations(state.document, elementIds, (document, elementId) => {
      const index = getElementIndexById(document, elementId);
      return index === undefined ? [] : deletePositionedElement(document, index);
    }),
  );
