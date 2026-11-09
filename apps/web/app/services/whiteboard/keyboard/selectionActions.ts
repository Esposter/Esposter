import type { WhiteboardEditState } from "@/models/whiteboard/WhiteboardEditState";
import type { PositionedDocument } from "vue-block-editor-headless";

import { duplicateWhiteboardElements } from "@/services/whiteboard/edit/duplicateWhiteboardElements";
import { getSelectedElements } from "@/services/whiteboard/getSelectedElements";
import { serializeClipboardElements } from "@/services/whiteboard/serializeClipboardElements";
import { getResultAsync } from "@esposter/shared";

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
// Writes the selected elements to the clipboard as marked text, and resolves to whether the clipboard took them. A refused write is
// Logged and reported as not written, so a cut deletes nothing the clipboard did not take
export const writeSelectionToClipboard = (document: PositionedDocument, selectedIds: string[]) =>
  getResultAsync(() =>
    window.navigator.clipboard.writeText(
      serializeClipboardElements(getSelectedElements(document, selectedIds).map(({ element }) => element)),
    ),
  ).match(
    () => true,
    (error) => {
      console.error(error);
      return false;
    },
  );
