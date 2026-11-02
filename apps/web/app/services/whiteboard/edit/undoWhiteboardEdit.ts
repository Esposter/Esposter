import type { WhiteboardEditState } from "@/models/whiteboard/WhiteboardEditState";

import { undoHistory } from "@esposter/shared";
import { applyBlockEdit, positionedDocumentSchema } from "headless-block-editor";

// Reverts the newest edit by applying its inverse patch, or leaves the state as it was when there is no edit to revert
export const undoWhiteboardEdit = (state: WhiteboardEditState): WhiteboardEditState => {
  const { entry, history } = undoHistory(state.history);
  if (entry === undefined) return state;

  return applyBlockEdit(positionedDocumentSchema, state.document, entry).match(
    ({ document }) => ({ document, history }),
    (error) => {
      throw error;
    },
  );
};
