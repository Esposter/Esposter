import type { UiCommand } from "@/models/ui/UiCommand";
import type { WhiteboardEditState } from "@/models/whiteboard/WhiteboardEditState";
import type { Point } from "headless-block-editor";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { applyWhiteboardEdit } from "@/services/whiteboard/edit/applyWhiteboardEdit";
import { deleteWhiteboardElements } from "@/services/whiteboard/edit/deleteWhiteboardElements";
import { duplicateWhiteboardElements } from "@/services/whiteboard/edit/duplicateWhiteboardElements";
import { undoWhiteboardEdit } from "@/services/whiteboard/edit/undoWhiteboardEdit";
import { getMoveOperations } from "@/services/whiteboard/gesture/getMoveOperations";
import {
  WHITEBOARD_COMMAND_GROUP,
  WHITEBOARD_NUDGE_DIRECTIONS,
  WHITEBOARD_NUDGE_LARGE_STEP,
  WHITEBOARD_NUDGE_STEP,
} from "@/services/whiteboard/keyboard/constants";

// The keys of a whiteboard's canvas, registered as its commands over its edit state and selection. Delete and Backspace do not delete at once: they
// Name the selection in deletingIds, the target of the confirmation dialog, and confirmDelete runs the deletion once the owner answers it. The
// Selection's commands are bound only while there is a selection, and none is bound while that dialog asks, so its keys never reach the canvas
export const useWhiteboardKeyboard = (
  editState: Ref<WhiteboardEditState>,
  selectedIds: Ref<string[]>,
  deletingIds: Ref<string[]>,
) => {
  const { isOpen: isDeleteOpen } = useSingletonDialog(deletingIds);

  const confirmDelete = () => {
    const deletedIds = deletingIds.value;
    editState.value = deleteWhiteboardElements(editState.value, deletedIds);
    selectedIds.value = selectedIds.value.filter((id) => !deletedIds.includes(id));
  };
  const deleteSelection = () => {
    deletingIds.value = selectedIds.value;
  };
  const deselect = () => {
    selectedIds.value = [];
  };
  const duplicateSelection = () => {
    const { copiedIds, state } = duplicateWhiteboardElements(editState.value, selectedIds.value);
    editState.value = state;
    selectedIds.value = copiedIds;
  };
  const nudgeSelection = (direction: Point, step: number) => {
    editState.value = applyWhiteboardEdit(
      editState.value,
      getMoveOperations(
        editState.value.document,
        selectedIds.value,
        { x: direction.x * step, y: direction.y * step },
        false,
      ),
    );
  };
  const undo = () => {
    editState.value = undoWhiteboardEdit(editState.value);
  };

  const undoCommand: UiCommand = {
    group: WHITEBOARD_COMMAND_GROUP,
    id: "whiteboard-undo",
    meaning: UiIconMeaning.Undo,
    run: undo,
    shortcut: "cmd+z",
    title: "Undo",
  };
  const selectionCommands: UiCommand[] = [
    {
      group: WHITEBOARD_COMMAND_GROUP,
      id: "whiteboard-delete",
      meaning: UiIconMeaning.Delete,
      run: deleteSelection,
      shortcut: "delete",
      title: "Delete the selection",
    },
    {
      group: WHITEBOARD_COMMAND_GROUP,
      id: "whiteboard-delete-backspace",
      meaning: UiIconMeaning.Delete,
      run: deleteSelection,
      shortcut: "backspace",
      title: "Delete the selection",
    },
    {
      group: WHITEBOARD_COMMAND_GROUP,
      id: "whiteboard-deselect",
      meaning: UiIconMeaning.Clear,
      run: deselect,
      shortcut: "escape",
      title: "Clear the selection",
    },
    {
      group: WHITEBOARD_COMMAND_GROUP,
      id: "whiteboard-duplicate",
      meaning: UiIconMeaning.Copy,
      run: duplicateSelection,
      shortcut: "cmd+d",
      title: "Duplicate the selection",
    },
    ...Object.entries(WHITEBOARD_NUDGE_DIRECTIONS).flatMap(([key, { direction, meaning, point }]) => [
      {
        group: WHITEBOARD_COMMAND_GROUP,
        id: `whiteboard-nudge-${direction}`,
        meaning,
        run: () => {
          nudgeSelection(point, WHITEBOARD_NUDGE_STEP);
        },
        shortcut: key.toLowerCase(),
        title: `Nudge the selection ${direction}`,
      },
      {
        group: WHITEBOARD_COMMAND_GROUP,
        id: `whiteboard-nudge-large-${direction}`,
        meaning,
        run: () => {
          nudgeSelection(point, WHITEBOARD_NUDGE_LARGE_STEP);
        },
        shortcut: `shift+${key.toLowerCase()}`,
        title: `Nudge the selection ${direction} by ${WHITEBOARD_NUDGE_LARGE_STEP}`,
      },
    ]),
  ];

  useCommands((): UiCommand[] => {
    if (isDeleteOpen.value) return [];
    if (selectedIds.value.length === 0) return [undoCommand];

    return [undoCommand, ...selectionCommands];
  });

  return { confirmDelete, isDeleteOpen };
};
