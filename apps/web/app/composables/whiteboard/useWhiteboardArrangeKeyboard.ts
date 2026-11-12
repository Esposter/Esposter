import type { UiCommand } from "@/models/ui/UiCommand";
import type { WhiteboardEditState } from "@/models/whiteboard/WhiteboardEditState";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { StackMove } from "@/models/whiteboard/StackMove";
import { getStackOperations } from "@/services/whiteboard/arrange/getStackOperations";
import { applyWhiteboardEdit } from "@/services/whiteboard/edit/applyWhiteboardEdit";
import { WHITEBOARD_COMMAND_GROUP } from "@/services/whiteboard/keyboard/constants";

// The keys that stack a selection. Cmd or Ctrl with the closing bracket brings it forward and with the opening bracket sends it backward, and Shift
// As well takes it to the front or the back, as the produced keys read it. The keys are bound only while there is a selection, and none is bound
// While the delete confirmation asks, so its keys never reach the canvas
export const useWhiteboardArrangeKeyboard = (
  editState: Ref<WhiteboardEditState>,
  selectedIds: Ref<string[]>,
  isDeleteOpen: Ref<boolean>,
) => {
  const stack = (move: StackMove) => {
    editState.value = applyWhiteboardEdit(
      editState.value,
      getStackOperations(editState.value.document, selectedIds.value, move),
    );
  };
  const stackingCommands: UiCommand[] = [
    {
      group: WHITEBOARD_COMMAND_GROUP,
      id: "whiteboard-bring-forward",
      meaning: UiIconMeaning.BringForward,
      run: () => {
        stack(StackMove.BringForward);
      },
      shortcut: "cmd+]",
      title: "Bring the selection forward",
    },
    {
      group: WHITEBOARD_COMMAND_GROUP,
      id: "whiteboard-send-backward",
      meaning: UiIconMeaning.SendBackward,
      run: () => {
        stack(StackMove.SendBackward);
      },
      shortcut: "cmd+[",
      title: "Send the selection backward",
    },
    {
      group: WHITEBOARD_COMMAND_GROUP,
      id: "whiteboard-bring-to-front",
      meaning: UiIconMeaning.BringToFront,
      run: () => {
        stack(StackMove.BringToFront);
      },
      shortcut: "cmd+shift+}",
      title: "Bring the selection to the front",
    },
    {
      group: WHITEBOARD_COMMAND_GROUP,
      id: "whiteboard-send-to-back",
      meaning: UiIconMeaning.SendToBack,
      run: () => {
        stack(StackMove.SendToBack);
      },
      shortcut: "cmd+shift+{",
      title: "Send the selection to the back",
    },
  ];

  useCommands((): UiCommand[] => {
    if (isDeleteOpen.value || selectedIds.value.length === 0) return [];

    return stackingCommands;
  });
};
