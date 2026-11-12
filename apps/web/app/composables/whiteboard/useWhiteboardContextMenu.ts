import type { UiContextMenuPoint } from "@/models/ui/UiContextMenuPoint";
import type { WhiteboardEditState } from "@/models/whiteboard/WhiteboardEditState";
import type { WhiteboardContextMenuCommands } from "@/services/whiteboard/contextMenu/getWhiteboardContextMenuItems";

import { StackMove } from "@/models/whiteboard/StackMove";
import { getStackOperations } from "@/services/whiteboard/arrange/getStackOperations";
import {
  getWhiteboardCanvasContextMenuItems,
  getWhiteboardContextMenuItems,
} from "@/services/whiteboard/contextMenu/getWhiteboardContextMenuItems";
import { getHitElementId } from "@/services/whiteboard/gesture/getHitElementId";
import { getHitTolerance } from "@/services/whiteboard/gesture/getHitTolerance";
import { getWorldPoint } from "@/services/whiteboard/gesture/getWorldPoint";
import { WHITEBOARD_RESET_SCALE } from "@/services/whiteboard/viewport/constants";
import { useAlertStore } from "@/store/alert";
import { useWhiteboardStore } from "@/store/resource/whiteboard";
import { useWhiteboardEditorStore } from "@/store/resource/whiteboard/editor";
import { useContextMenuStore } from "@/store/ui/contextMenu";
import { getResultAsync } from "@esposter/shared";
import { getPositionedElementText } from "vue-block-editor-headless";

// The whiteboard's own context menu, opened on a right-click of its canvas. The element under the pointer is selected first unless the selection
// Already holds it, and empty canvas clears the selection, so the menu is always about what is selected when it opens. Every item runs the
// Function its shortcut runs, handed in by the keyboard, and the stacking steps are the stacking keys' own operations, listed for a selection that they can move
export const useWhiteboardContextMenu = (
  editState: Ref<WhiteboardEditState>,
  commands: Pick<WhiteboardContextMenuCommands, "copy" | "cut" | "deleteSelection" | "duplicate" | "selectAll"> & {
    editText: (elementId: string) => void;
    pasteText: (text: string) => void;
  },
) => {
  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
  const contextMenuStore = useContextMenuStore();
  const { openContextMenu } = contextMenuStore;
  const whiteboardStore = useWhiteboardStore();
  const { commitOperations } = whiteboardStore;
  const whiteboardEditorStore = useWhiteboardEditorStore();
  const { canvasRect, selectedIds, viewport } = storeToRefs(whiteboardEditorStore);
  const { fitToElements, zoomTo } = whiteboardEditorStore;
  const { pasteText, ...selectionCommands } = commands;
  // The paste event cannot fire from a menu, so the clipboard is read when the item is chosen, and a read the browser refuses is told to the owner
  const paste = () =>
    getResultAsync(() => window.navigator.clipboard.readText()).match(pasteText, () => {
      createAlert("Could not read the clipboard.", "error");
    });
  const fitToContent = () => {
    fitToElements(editState.value.document.elements);
  };
  const resetZoom = () => {
    zoomTo(WHITEBOARD_RESET_SCALE);
  };
  // A stacking step is listed only when the selection can move that way, and runs the operations the stacking keys run over the selection as it is then
  const getStackCommand = (move: StackMove) => {
    if (getStackOperations(editState.value.document, selectedIds.value, move).length === 0) return undefined;

    return () => {
      commitOperations(getStackOperations(editState.value.document, selectedIds.value, move));
    };
  };
  const getSelectionItems = () => {
    const { elements } = editState.value.document;
    const [selectedId] = selectedIds.value;
    const index = elements.findIndex(({ id }) => id === selectedId);
    const isSingle = selectedIds.value.length === 1 && index !== -1;
    const element = elements[index];
    const hasText = element !== undefined && getPositionedElementText(element) !== undefined;
    return getWhiteboardContextMenuItems({
      ...selectionCommands,
      bringForward: getStackCommand(StackMove.BringForward),
      bringToFront: getStackCommand(StackMove.BringToFront),
      editText:
        isSingle && hasText && selectedId !== undefined ? () => selectionCommands.editText(selectedId) : undefined,
      fitToContent,
      paste,
      resetZoom,
      selectAll: selectionCommands.selectAll,
      sendBackward: getStackCommand(StackMove.SendBackward),
      sendToBack: getStackCommand(StackMove.SendToBack),
    });
  };
  // A menu from the keyboard opens at the canvas's corner, which says nothing about what the reader points at, so it keeps the selection
  const onOpenContextMenu = (point: UiContextMenuPoint, isFromPointer: boolean) => {
    if (isFromPointer) {
      const elementId = getHitElementId(
        editState.value.document,
        getWorldPoint({ x: point.x - canvasRect.value.x, y: point.y - canvasRect.value.y }, viewport.value),
        getHitTolerance(viewport.value.scale),
      );
      if (elementId === undefined) selectedIds.value = [];
      else if (!selectedIds.value.includes(elementId)) selectedIds.value = [elementId];
    }

    openContextMenu({
      ...point,
      items:
        selectedIds.value.length === 0
          ? getWhiteboardCanvasContextMenuItems({
              fitToContent,
              paste,
              resetZoom,
              selectAll: selectionCommands.selectAll,
            })
          : getSelectionItems(),
      key: "whiteboard",
    });
  };
  return { onOpenContextMenu };
};
