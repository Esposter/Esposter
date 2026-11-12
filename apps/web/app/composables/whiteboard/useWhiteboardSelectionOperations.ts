import type { JsonPatchOperation } from "@esposter/shared";
import type { PositionedDocument } from "vue-block-editor-headless";

import { useWhiteboardStore } from "@/store/resource/whiteboard";
import { useWhiteboardEditorStore } from "@/store/resource/whiteboard/editor";

// A control that changes the selection: whether its change would move nothing, so it is disabled, and its commit, which is one undo step
export const useWhiteboardSelectionOperations = <TInput>(
  getOperations: (document: PositionedDocument, selectedIds: string[], input: TInput) => JsonPatchOperation[],
) => {
  const whiteboardStore = useWhiteboardStore();
  const { commitOperations } = whiteboardStore;
  const { editState } = storeToRefs(whiteboardStore);
  const whiteboardEditorStore = useWhiteboardEditorStore();
  const { selectedIds } = storeToRefs(whiteboardEditorStore);
  const getSelectionOperations = (input: TInput) => getOperations(editState.value.document, selectedIds.value, input);
  return {
    checkIsDisabled: (input: TInput) => getSelectionOperations(input).length === 0,
    commit: (input: TInput) => {
      commitOperations(getSelectionOperations(input));
    },
  };
};
