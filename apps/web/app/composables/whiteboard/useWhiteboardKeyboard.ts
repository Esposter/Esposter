import type { UiCommand } from "@/models/ui/UiCommand";
import type { WhiteboardEditState } from "@/models/whiteboard/WhiteboardEditState";
import type { Point, ShapeKind } from "vue-block-editor-headless";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { GestureTool } from "@/models/whiteboard/GestureTool";
import { getHistoryCommands } from "@/services/ui/getHistoryCommands";
import { applyWhiteboardEdit } from "@/services/whiteboard/edit/applyWhiteboardEdit";
import { deleteWhiteboardElements } from "@/services/whiteboard/edit/deleteWhiteboardElements";
import { pasteWhiteboardElements } from "@/services/whiteboard/edit/pasteWhiteboardElements";
import { redoWhiteboardEdit } from "@/services/whiteboard/edit/redoWhiteboardEdit";
import { undoWhiteboardEdit } from "@/services/whiteboard/edit/undoWhiteboardEdit";
import { getMoveOperations } from "@/services/whiteboard/gesture/getMoveOperations";
import {
  WHITEBOARD_COMMAND_GROUP,
  WHITEBOARD_NUDGE_DIRECTIONS,
  WHITEBOARD_NUDGE_LARGE_STEP,
  WHITEBOARD_NUDGE_STEP,
} from "@/services/whiteboard/keyboard/constants";
import {
  copySelection,
  requestSelectionDelete,
  writeSelectionToClipboard,
} from "@/services/whiteboard/keyboard/selectionActions";
import { WhiteboardShapeItemMap } from "@/services/whiteboard/tool/WhiteboardShapeItemMap";
import { WhiteboardToolItemMap } from "@/services/whiteboard/tool/WhiteboardToolItemMap";

// The keys of a whiteboard's canvas, registered as its commands over its edit state and selection.
// Delete and Backspace do not delete at once. They name the selection in deletingIds, the target of the confirmation dialog, and confirmDelete runs the deletion once the owner answers it.
// The selection's commands are bound only while there is a selection, and none is bound while that dialog asks, so its keys never reach the canvas.
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
  // Deletes the elements as one edit, and drops them from the selection
  const removeElements = (elementIds: string[]) => {
    editState.value = deleteWhiteboardElements(editState.value, elementIds);
    selectedIds.value = selectedIds.value.filter((id) => !elementIds.includes(id));
  };
  const confirmDelete = () => {
    removeElements(deletingIds.value);
  };
  const copySelectionToClipboard = async () => {
    await writeSelectionToClipboard(editState.value.document, selectedIds.value);
  };
  // A cut deletes only once the clipboard has taken the elements, so a refused write leaves the board as it was
  const cutSelection = async () => {
    const cutIds = selectedIds.value;
    if (await writeSelectionToClipboard(editState.value.document, cutIds)) removeElements(cutIds);
  };
  const deleteSelection = () => {
    requestSelectionDelete(deletingIds, selectedIds);
  };
  const deselect = () => {
    selectedIds.value = [];
  };
  const duplicateSelection = () => {
    copySelection(editState, selectedIds);
  };
  // The clipboard text the canvas's paste event hands over. Text without the marker pastes nothing, so the selection is left as it was
  const pasteClipboardText = (text: string) => {
    const pasted = pasteWhiteboardElements(editState.value, text);
    if (pasted === undefined) return;

    editState.value = pasted.state;
    selectedIds.value = pasted.copiedIds;
  };
  const selectAll = () => {
    selectedIds.value = editState.value.document.elements.map(({ id }) => id);
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
  // Select all is bound with or without a selection, and the paste is listed with its shortcut but never bound: the canvas's paste
  // Event takes it, since a bound key would prevent the native paste the image handler also reads
  const editCommands: UiCommand[] = [
    {
      group: WHITEBOARD_COMMAND_GROUP,
      id: "whiteboard-select-all",
      meaning: UiIconMeaning.SelectAll,
      run: selectAll,
      shortcut: "cmd+a",
      title: "Select every element",
    },
    {
      group: WHITEBOARD_COMMAND_GROUP,
      id: "whiteboard-paste",
      meaning: UiIconMeaning.Paste,
      shortcut: "cmd+v",
      title: "Paste the elements",
    },
  ];
  const selectionCommands: UiCommand[] = [
    {
      group: WHITEBOARD_COMMAND_GROUP,
      id: "whiteboard-copy",
      meaning: UiIconMeaning.Copy,
      run: copySelectionToClipboard,
      shortcut: "cmd+c",
      title: "Copy the selection",
    },
    {
      group: WHITEBOARD_COMMAND_GROUP,
      id: "whiteboard-cut",
      meaning: UiIconMeaning.Delete,
      run: cutSelection,
      shortcut: "cmd+x",
      title: "Cut the selection",
    },
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
    if (selectedIds.value.length === 0) return [...historyCommands, ...editCommands, ...toolCommands];

    return [...historyCommands, ...editCommands, ...toolCommands, ...selectionCommands];
  });

  return { confirmDelete, isDeleteOpen, pasteClipboardText };
};
