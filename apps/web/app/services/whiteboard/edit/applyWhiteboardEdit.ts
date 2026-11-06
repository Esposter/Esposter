import type { WhiteboardEditState } from "@/models/whiteboard/WhiteboardEditState";
import type { JsonPatchOperation } from "@esposter/shared";

import { pushHistory } from "@esposter/shared";
import { applyBlockEdit, positionedDocumentSchema } from "headless-block-editor";

// Applies an edit's operations as one step of the undo history, or leaves the state as it was when there are none
// A refused edit throws: the commands only return operations the document's schema accepts, so a refusal is a bug to surface
export const applyWhiteboardEdit = (
  state: WhiteboardEditState,
  operations: JsonPatchOperation[],
): WhiteboardEditState => {
  if (operations.length === 0) return state;

  return applyBlockEdit(positionedDocumentSchema, state.document, operations).match(
    ({ document, inverses }) => ({ document, history: pushHistory(state.history, { inverses, operations }) }),
    (error) => {
      throw error;
    },
  );
};
