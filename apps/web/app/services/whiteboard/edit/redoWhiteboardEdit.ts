import type { WhiteboardEditState } from "@/models/whiteboard/WhiteboardEditState";

import { redoHistory } from "@esposter/shared";
import { applyBlockEdit, positionedDocumentSchema } from "headless-block-editor";

// Reapplies the newest undone edit by applying its operations, or leaves the state as it was when there is no undone edit to reapply
export const redoWhiteboardEdit = (state: WhiteboardEditState): WhiteboardEditState => {
  const { entry, history } = redoHistory(state.history);
  if (entry === undefined) return state;

  return applyBlockEdit(positionedDocumentSchema, state.document, entry.operations).match(
    ({ document }) => ({ document, history }),
    (error) => {
      throw error;
    },
  );
};
