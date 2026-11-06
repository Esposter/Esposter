import type { UiCommand } from "@/models/ui/UiCommand";
import type { WhiteboardEditState } from "@/models/whiteboard/WhiteboardEditState";
import type { Point, ShapeKind } from "headless-block-editor";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { GestureTool } from "@/models/whiteboard/GestureTool";
import { getHistoryCommands } from "@/services/ui/getHistoryCommands";
import { applyWhiteboardEdit } from "@/services/whiteboard/edit/applyWhiteboardEdit";
import { deleteWhiteboardElements } from "@/services/whiteboard/edit/deleteWhiteboardElements";
import { duplicateWhiteboardElements } from "@/services/whiteboard/edit/duplicateWhiteboardElements";
import { redoWhiteboardEdit } from "@/services/whiteboard/edit/redoWhiteboardEdit";
import { undoWhiteboardEdit } from "@/services/whiteboard/edit/undoWhiteboardEdit";
import { getMoveOperations } from "@/services/whiteboard/gesture/getMoveOperations";
import {
  WHITEBOARD_COMMAND_GROUP,
  WHITEBOARD_NUDGE_DIRECTIONS,
  WHITEBOARD_NUDGE_LARGE_STEP,
  WHITEBOARD_NUDGE_STEP,
} from "@/services/whiteboard/keyboard/constants";
import { WhiteboardShapeItemMap } from "@/services/whiteboard/tool/WhiteboardShapeItemMap";
import { WhiteboardToolItemMap } from "@/services/whiteboard/tool/WhiteboardToolItemMap";

// The keys of a whiteboard's canvas, registered as its commands over its edit state and selection. Delete and Backspace do not delete at once: they
// name the selection in deletingIds, the target of the confirmation dialog, and confirmDelete runs the deletion once the owner answers it. The
// selection's commands are bound only while there is a selection, and none is bound while that dialog asks, so its keys never reach the canvas.
// A tool's key chooses the tool in hand, and a shape's key chooses the shape tool with the shape it names. Each key is the one its item carries
export const useWhiteboardKeyboard = (
  editState: Ref<WhiteboardEditState>,
  selectedIds: Ref<string[]>,
  deletingIds: Ref<string[]>,
  tool: Ref<GestureTool>,
  shapeKind: Ref<ShapeKind>,
) => {
  const { isOpen: isDeleteOpen } = useSingletonDialog(deletingIds);

  const chooseTool = (nextTool: GestureTool) => {
    tool.value = nextTool;
  };
  const chooseShape = (nextShapeKind: ShapeKind) => {
    tool.value = GestureTool.Shape;
    shapeKind.value = nextShapeKind;
  };
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
  const redo = () => {
    editState.value = redoWhiteboardEdit(editState.value);
  };
  const undo = () => {
    editState.value = undoWhiteboardEdit(editState.value);
  };

  const historyCommands = getHistoryCommands({
    group: WHITEBOARD_COMMAND_GROUP,
    idPrefix: "whiteboard",
    redo,
    redoTitle: "Redo",
    undo,
    undoTitle: "Undo",
  });
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

  const toolCommands: UiCommand[] = [
    ...Object.values(WhiteboardToolItemMap).map(({ meaning, shortcut, title, value }) => ({
      group: WHITEBOARD_COMMAND_GROUP,
      id: `whiteboard-tool-${value}`,
      meaning,
      run: () => {
        chooseTool(value);
      },
      shortcut,
      title: `${title} tool`,
    })),
    ...Object.values(WhiteboardShapeItemMap)
      .filter(({ shortcut }) => shortcut !== undefined)
      .map(({ meaning, shortcut, title, value }) => ({
        group: WHITEBOARD_COMMAND_GROUP,
        id: `whiteboard-shape-${value}`,
        meaning,
        run: () => {
          chooseShape(value);
        },
        shortcut,
        title: `${title} tool`,
      })),
  ];

  useCommands((): UiCommand[] => {
    if (isDeleteOpen.value) return [];
    if (selectedIds.value.length === 0) return [...historyCommands, ...toolCommands];

    return [...historyCommands, ...toolCommands, ...selectionCommands];
  });

  return { confirmDelete, isDeleteOpen };
};
