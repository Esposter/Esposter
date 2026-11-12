import type { UiContextMenuPoint } from "@/models/ui/UiContextMenuPoint";
import type { WhiteboardEditState } from "@/models/whiteboard/WhiteboardEditState";
import type { WhiteboardContextMenuCommands } from "@/services/whiteboard/contextMenu/getWhiteboardContextMenuItems";

import { getHitElementId } from "@/services/whiteboard/gesture/getHitElementId";
import { getHitTolerance } from "@/services/whiteboard/gesture/getHitTolerance";
import { getWorldPoint } from "@/services/whiteboard/gesture/getWorldPoint";
import {
  getWhiteboardCanvasContextMenuItems,
  getWhiteboardContextMenuItems,
} from "@/services/whiteboard/contextMenu/getWhiteboardContextMenuItems";
import { WHITEBOARD_RESET_SCALE } from "@/services/whiteboard/viewport/constants";
import { useAlertStore } from "@/store/alert";
import { useWhiteboardStore } from "@/store/resource/whiteboard";
import { useWhiteboardEditorStore } from "@/store/resource/whiteboard/editor";
import { useContextMenuStore } from "@/store/ui/contextMenu";
import { getResultAsync } from "@esposter/shared";
import { changePositionedElementZOrder, getExportBounds, getPositionedElementText } from "vue-block-editor-headless";

// The whiteboard's own context menu, opened on a right-click of its canvas. The element under the pointer is selected first unless the selection
// Already holds it, and empty canvas clears the selection, so the menu is always about what is selected when it opens. Every item runs the
// Function its shortcut runs, handed in by the keyboard, and the stacking steps are listed for one selected element that they can move
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
  const { fitTo, zoomTo } = whiteboardEditorStore;
  const { pasteText, ...selectionCommands } = commands;
  // The paste event cannot fire from a menu, so the clipboard is read when the item is chosen, and a read the browser refuses is told to the owner
  const paste = () =>
    getResultAsync(() => window.navigator.clipboard.readText()).match(pasteText, () => {
      createAlert("Could not read the clipboard.", "error");
    });
  const fitToContent = () => {
    const { elements } = editState.value.document;
    if (elements.length > 0) fitTo(getExportBounds({ elements }));
  };
  const resetZoom = () => {
    zoomTo(WHITEBOARD_RESET_SCALE);
  };
  const getSelectionItems = () => {
    const { elements } = editState.value.document;
    const [selectedId] = selectedIds.value;
    const index = elements.findIndex(({ id }) => id === selectedId);
    const lastIndex = elements.length - 1;
    const isSingle = selectedIds.value.length === 1 && index !== -1;
    const element = elements[index];
    const hasText = element !== undefined && getPositionedElementText(element) !== undefined;
    const changeZOrder = (toIndex: number) => () => {
      commitOperations(changePositionedElementZOrder(editState.value.document, index, toIndex));
    };
    return getWhiteboardContextMenuItems({
      ...selectionCommands,
      bringForward: isSingle && index < lastIndex ? changeZOrder(index + 1) : undefined,
      bringToFront: isSingle && index < lastIndex ? changeZOrder(lastIndex) : undefined,
      editText:
        isSingle && hasText && selectedId !== undefined ? () => selectionCommands.editText(selectedId) : undefined,
      fitToContent,
      paste,
      resetZoom,
      selectAll: selectionCommands.selectAll,
      sendBackward: isSingle && index > 0 ? changeZOrder(index - 1) : undefined,
      sendToBack: isSingle && index > 0 ? changeZOrder(0) : undefined,
    });
  };
  const onOpenContextMenu = (point: UiContextMenuPoint) => {
    const elementId = getHitElementId(
      editState.value.document,
      getWorldPoint({ x: point.x - canvasRect.value.x, y: point.y - canvasRect.value.y }, viewport.value),
      getHitTolerance(viewport.value.scale),
    );
    if (elementId === undefined) selectedIds.value = [];
    else if (!selectedIds.value.includes(elementId)) selectedIds.value = [elementId];

    openContextMenu({
      ...point,
      items:
        elementId === undefined
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
