import type { UiCommand } from "@/models/ui/UiCommand";
import type { PositionedElement } from "vue-block-editor-headless";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { getSelectedElements } from "@/services/whiteboard/getSelectedElements";
import { WHITEBOARD_COMMAND_GROUP } from "@/services/whiteboard/keyboard/constants";
import { WHITEBOARD_RESET_SCALE } from "@/services/whiteboard/viewport/constants";
import { useWhiteboardStore } from "@/store/resource/whiteboard";
import { useWhiteboardEditorStore } from "@/store/resource/whiteboard/editor";
import { checkIsEditableTarget } from "@/util/dom/checkIsEditableTarget";
import { checkIsElementTarget } from "@/util/dom/checkIsElementTarget";
import { defaultWindow } from "@vueuse/core";
import { getExportBounds } from "vue-block-editor-headless";

// The keys that move a whiteboard's view: Ctrl or Cmd with 0 resets the zoom about the view's centre, Shift with 1 fits the content and Shift
// With 2 the selection. A fit of nothing has no bounds to show, so an empty board leaves the view where it is. Space is read by its key down
// And up instead, since it is held: it pans for as long as it is down, and a key typed into a field is text, so Space there is left alone
export const useWhiteboardViewportKeyboard = () => {
  const whiteboardStore = useWhiteboardStore();
  const { editState } = storeToRefs(whiteboardStore);
  const whiteboardEditorStore = useWhiteboardEditorStore();
  const { isSpaceHeld, selectedIds } = storeToRefs(whiteboardEditorStore);
  const { fitTo, zoomTo } = whiteboardEditorStore;
  const fitElements = (elements: PositionedElement[]) => {
    if (elements.length > 0) fitTo(getExportBounds({ elements }));
  };
  const commands: UiCommand[] = [
    {
      group: WHITEBOARD_COMMAND_GROUP,
      id: "whiteboard-zoom-reset",
      meaning: UiIconMeaning.ResetView,
      run: () => {
        zoomTo(WHITEBOARD_RESET_SCALE);
      },
      shortcut: "cmd+0",
      title: "Reset the zoom",
    },
    {
      group: WHITEBOARD_COMMAND_GROUP,
      id: "whiteboard-fit-content",
      meaning: UiIconMeaning.FitToContent,
      run: () => {
        fitElements(editState.value.document.elements);
      },
      shortcut: "shift+!",
      title: "Fit the content",
    },
    {
      group: WHITEBOARD_COMMAND_GROUP,
      id: "whiteboard-fit-selection",
      meaning: UiIconMeaning.FitPage,
      run: () => {
        fitElements(getSelectedElements(editState.value.document, selectedIds.value).map(({ element }) => element));
      },
      shortcut: "shift+@",
      title: "Fit the selection",
    },
  ];
  useCommands(commands);
  // Casts (not instanceof) as usePushToTalk does, since the window's key events are typed as Event here
  useEventListener(defaultWindow, "keydown", (event) => {
    const keyboardEvent = event as KeyboardEvent;
    const { target } = keyboardEvent;
    if (keyboardEvent.code !== "Space" || checkIsEditableTarget(target)) return;
    // A focused button or link is pressed by Space, which a pan must not take from it
    if (checkIsElementTarget(target) && target.closest("button, a[href], summary, [role='button']")) return;

    keyboardEvent.preventDefault();
    isSpaceHeld.value = true;
  });
  useEventListener(defaultWindow, "keyup", (event) => {
    if ((event as KeyboardEvent).code === "Space") isSpaceHeld.value = false;
  });
  // A key released while the window is blurred is never seen, so the pan ends with the window
  useEventListener(defaultWindow, "blur", () => {
    isSpaceHeld.value = false;
  });
};
