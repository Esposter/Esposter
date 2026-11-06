import type { WhiteboardEditState } from "@/models/whiteboard/WhiteboardEditState";
import type { WhiteboardTextEdit } from "@/models/whiteboard/WhiteboardTextEdit";

import { WhiteboardTextEditAction } from "@/models/whiteboard/WhiteboardTextEditAction";
import { applyWhiteboardEdit } from "@/services/whiteboard/edit/applyWhiteboardEdit";
import { getTextEditAction } from "@/services/whiteboard/text/getTextEditAction";
import { getTextEditOperations } from "@/services/whiteboard/text/getTextEditOperations";
import { getPositionedElementText } from "vue-block-editor-headless";

// A text edited in place on a whiteboard: a shape's text, an arrow's label or a sticky note's text, opened by a double click. The draft is written
// Once, on commit, which a blur or Enter makes. A commit that arrives during an input-method composition waits for the composition to end, and Escape discards the draft
export const useWhiteboardTextEdit = (editState: Ref<WhiteboardEditState>) => {
  const textEdit = ref<WhiteboardTextEdit>();

  const patchTextEdit = (patch: Partial<WhiteboardTextEdit>) => {
    if (textEdit.value === undefined) return;

    textEdit.value = { ...textEdit.value, ...patch };
  };

  const commitTextEdit = () => {
    if (textEdit.value === undefined) return;
    if (textEdit.value.isComposing) {
      patchTextEdit({ isCommitPending: true });
      return;
    }

    editState.value = applyWhiteboardEdit(
      editState.value,
      getTextEditOperations(editState.value.document, textEdit.value),
    );
    textEdit.value = undefined;
  };

  const discardTextEdit = () => {
    textEdit.value = undefined;
  };

  const actionHandlerMap: Record<WhiteboardTextEditAction, () => void> = {
    [WhiteboardTextEditAction.Commit]: commitTextEdit,
    [WhiteboardTextEditAction.Discard]: discardTextEdit,
  };

  const draft = computed({
    get: () => textEdit.value?.draft ?? "",
    set: (newDraft) => {
      patchTextEdit({ draft: newDraft });
    },
  });

  const startTextEdit = (elementId: string) => {
    const element = editState.value.document.elements.find(({ id }) => id === elementId);
    if (element === undefined) return;

    const text = getPositionedElementText(element);
    if (text === undefined) return;

    textEdit.value = { draft: text, elementId, isCommitPending: false, isComposing: false };
  };

  const onCompositionStart = () => {
    patchTextEdit({ isComposing: true });
  };

  const onCompositionEnd = () => {
    patchTextEdit({ isComposing: false });
    if (textEdit.value?.isCommitPending) commitTextEdit();
  };

  const onKeydown = (event: KeyboardEvent) => {
    const action = getTextEditAction(event);
    if (action === undefined) return;

    event.preventDefault();
    actionHandlerMap[action]();
  };

  return {
    draft,
    onBlur: commitTextEdit,
    onCompositionEnd,
    onCompositionStart,
    onKeydown,
    startTextEdit,
    textEdit: readonly(textEdit),
  };
};
