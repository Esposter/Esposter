import type { WhiteboardEditState } from "@/models/whiteboard/WhiteboardEditState";

import { duplicateWhiteboardElements } from "@/services/whiteboard/edit/duplicateWhiteboardElements";

// The two edits a selection takes from the keys and the properties footer alike, so both paths write the same state
// Delete only names the selection for the confirmation, which runs the deletion once the owner answers it
export const requestSelectionDelete = (deletingIds: Ref<string[]>, selectedIds: Ref<string[]>) => {
  deletingIds.value = selectedIds.value;
};
// Copies the selection onto the elements and moves the selection onto the copies
export const copySelection = (editState: Ref<WhiteboardEditState>, selectedIds: Ref<string[]>) => {
  const { copiedIds, state } = duplicateWhiteboardElements(editState.value, selectedIds.value);
  editState.value = state;
  selectedIds.value = copiedIds;
};
