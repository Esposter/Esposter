import type { WhiteboardElement } from "#shared/models/resource/whiteboard/WhiteboardElement";
import type { WhiteboardEditState } from "@/models/whiteboard/WhiteboardEditState";
import type { WhiteboardHistoryEntry } from "@/models/whiteboard/WhiteboardHistoryEntry";
import type { JsonPatchOperation } from "@esposter/shared";
import type { PositionedDocument, PositionedElementProperty } from "headless-block-editor";

import { createContentData } from "@/services/resource/createContentData";
import { MAX_WHITEBOARD_HISTORY_SIZE } from "@/services/resource/whiteboard/constants";
import { createErrorAlert } from "@/services/trpc/createErrorAlert";
import { applyWhiteboardEdit } from "@/services/whiteboard/edit/applyWhiteboardEdit";
import { redoWhiteboardEdit } from "@/services/whiteboard/edit/redoWhiteboardEdit";
import { undoWhiteboardEdit } from "@/services/whiteboard/edit/undoWhiteboardEdit";
import { useWhiteboardEditorStore } from "@/store/resource/whiteboard/editor";
import { ResourceType } from "@esposter/db-schema";
import { getResult } from "@esposter/shared";
import { insertPositionedElement, updatePositionedElementProperty, useEditSession } from "headless-block-editor";

// A whiteboard's saved document, with the undo history of the edits made to it this session. Each edit is one commit, so one
// Undo step, and a document read from the server starts a fresh history
export const useWhiteboardStore = defineStore("resource/whiteboard", () => {
  const whiteboardEditorStore = useWhiteboardEditorStore();
  const { selectElement } = whiteboardEditorStore;
  const {
    content: whiteboard,
    loadContent,
    saveContent: saveWhiteboard,
  } = createContentData<ResourceType.Whiteboard>(ResourceType.Whiteboard, (data) => data ?? { elements: [] });
  // The session clears the history whenever the content is set from outside a commit, so a read from the server starts afresh
  const { commit, history } = useEditSession<PositionedDocument, WhiteboardHistoryEntry>(
    whiteboard,
    MAX_WHITEBOARD_HISTORY_SIZE,
  );
  const editState = computed<WhiteboardEditState>({
    get: () => ({ document: whiteboard.value, history: history.value }),
    set: (state) => {
      commit(state.document, state.history);
    },
  });
  // The document the canvas shows: the one a gesture in progress would leave, or else the committed one
  const displayedDocument = computed(() => whiteboardEditorStore.preview ?? editState.value.document);
  // A commit is refused with the document unchanged, and the owner is told why
  const commitOperations = (operations: JsonPatchOperation[]): boolean =>
    getResult(() => {
      editState.value = applyWhiteboardEdit(editState.value, operations);
    }).match(
      () => true,
      (error) => {
        createErrorAlert(error);
        return false;
      },
    );
  const insertElement = (element: WhiteboardElement) => {
    const index = whiteboard.value.elements.length;
    if (commitOperations(insertPositionedElement(whiteboard.value, index, element))) selectElement(element.id);
  };
  // A property edit is one commit on the element at an index, so it is one undo step
  const updateElementProperty = (index: number, change: PositionedElementProperty): boolean =>
    commitOperations(updatePositionedElementProperty(whiteboard.value, index, change));
  // Steps back or forward through the history, as the undo and redo buttons and the keys do
  const redo = () => {
    editState.value = redoWhiteboardEdit(editState.value);
  };
  const undo = () => {
    editState.value = undoWhiteboardEdit(editState.value);
  };
  return {
    commitOperations,
    displayedDocument,
    editState,
    insertElement,
    loadContent,
    redo,
    saveWhiteboard,
    undo,
    updateElementProperty,
    whiteboard,
  };
});
