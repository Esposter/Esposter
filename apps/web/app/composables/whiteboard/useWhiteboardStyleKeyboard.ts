import type { UiCommand } from "#src/models/ui/UiCommand";
import type { WhiteboardEditState } from "#src/models/whiteboard/WhiteboardEditState";

import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { applyWhiteboardEdit } from "#src/services/whiteboard/edit/applyWhiteboardEdit";
import { getSelectedElements } from "#src/services/whiteboard/getSelectedElements";
import { WHITEBOARD_COMMAND_GROUP } from "#src/services/whiteboard/keyboard/constants";
import {
  WHITEBOARD_STYLE_COPY_SHORTCUT,
  WHITEBOARD_STYLE_PASTE_SHORTCUT,
} from "#src/services/whiteboard/style/constants";
import { getWhiteboardStyle } from "#src/services/whiteboard/style/getWhiteboardStyle";
import { getWhiteboardStyleOperations } from "#src/services/whiteboard/style/getWhiteboardStyleOperations";
import { useWhiteboardStyleClipboardStore } from "#src/store/resource/whiteboard/styleClipboard";

// The keys that copy the look of the one selected element and paste the copied look onto the selection. Copy is bound only while exactly one element
// Is selected, paste while any is, and neither while the delete confirmation asks, so their keys never reach the canvas
export const useWhiteboardStyleKeyboard = (
  editState: Ref<WhiteboardEditState>,
  selectedIds: Ref<string[]>,
  isDeleteOpen: Ref<boolean>,
) => {
  const whiteboardStyleClipboardStore = useWhiteboardStyleClipboardStore();
  const { copiedStyle } = storeToRefs(whiteboardStyleClipboardStore);
  const { setCopiedStyle } = whiteboardStyleClipboardStore;
  const copyStyle = () => {
    const [selected] = getSelectedElements(editState.value.document, selectedIds.value);
    if (selected) setCopiedStyle(getWhiteboardStyle(selected.element));
  };
  const pasteStyle = () => {
    editState.value = applyWhiteboardEdit(
      editState.value,
      getWhiteboardStyleOperations(editState.value.document, selectedIds.value, copiedStyle.value),
    );
  };
  const copyCommand: UiCommand = {
    group: WHITEBOARD_COMMAND_GROUP,
    id: "whiteboard-copy-style",
    meaning: UiIconMeaning.Copy,
    run: () => {
      copyStyle();
    },
    shortcut: WHITEBOARD_STYLE_COPY_SHORTCUT,
    title: "Copy the style of the selected element",
  };
  const pasteCommand: UiCommand = {
    group: WHITEBOARD_COMMAND_GROUP,
    id: "whiteboard-paste-style",
    meaning: UiIconMeaning.Paste,
    run: () => {
      pasteStyle();
    },
    shortcut: WHITEBOARD_STYLE_PASTE_SHORTCUT,
    title: "Paste the copied style onto the selection",
  };

  useCommands((): UiCommand[] => {
    if (isDeleteOpen.value || selectedIds.value.length === 0) return [];

    return selectedIds.value.length === 1 ? [copyCommand, pasteCommand] : [pasteCommand];
  });
};
