import type { Item } from "@/models/shared/Item";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

// What a whiteboard's context menu runs, each the function the same command's shortcut runs, so the menu and the keys never disagree.
// The stacking steps are given by their target index, and are absent unless exactly one element is selected
export interface WhiteboardContextMenuCommands {
  bringForward?: () => void;
  bringToFront?: () => void;
  copy: () => Promise<void>;
  cut: () => Promise<void>;
  deleteSelection: () => void;
  duplicate: () => void;
  editText?: () => void;
  fitToContent: () => void;
  paste: () => Promise<void>;
  resetZoom: () => void;
  selectAll: () => void;
  sendBackward?: () => void;
  sendToBack?: () => void;
}

// The items over a selection: the clipboard commands, the stacking of one element, the text of an element that has some, and delete last in the
// Danger colour. A stacking step is listed only when it can move the element, as the properties panel disables the others
export const getWhiteboardContextMenuItems = (commands: WhiteboardContextMenuCommands): Item[] => {
  const {
    bringForward,
    bringToFront,
    copy,
    cut,
    deleteSelection,
    duplicate,
    editText,
    paste,
    sendBackward,
    sendToBack,
  } = commands;
  const stackingItems: Item[] = [
    ...(sendToBack ? [{ meaning: UiIconMeaning.SendToBack, onClick: sendToBack, title: "Send to back" }] : []),
    ...(sendBackward ? [{ meaning: UiIconMeaning.SendBackward, onClick: sendBackward, title: "Send backward" }] : []),
    ...(bringForward ? [{ meaning: UiIconMeaning.BringForward, onClick: bringForward, title: "Bring forward" }] : []),
    ...(bringToFront ? [{ meaning: UiIconMeaning.BringToFront, onClick: bringToFront, title: "Bring to front" }] : []),
  ];
  return [
    ...(editText ? [{ meaning: UiIconMeaning.Edit, onClick: editText, title: "Edit text" }] : []),
    { isGroupStart: Boolean(editText), meaning: UiIconMeaning.Delete, onClick: cut, title: "Cut" },
    { meaning: UiIconMeaning.Copy, onClick: copy, title: "Copy" },
    { meaning: UiIconMeaning.Paste, onClick: paste, title: "Paste" },
    { meaning: UiIconMeaning.Copy, onClick: duplicate, title: "Duplicate" },
    ...stackingItems.map((item, index) => ({ ...item, isGroupStart: index === 0 })),
    { isDanger: true, isGroupStart: true, meaning: UiIconMeaning.Delete, onClick: deleteSelection, title: "Delete" },
  ];
};

// The items over empty canvas, which are the board's: paste, select all, and the two views of the canvas
export const getWhiteboardCanvasContextMenuItems = ({
  fitToContent,
  paste,
  resetZoom,
  selectAll,
}: Pick<WhiteboardContextMenuCommands, "fitToContent" | "paste" | "resetZoom" | "selectAll">): Item[] => [
  { meaning: UiIconMeaning.Paste, onClick: paste, title: "Paste" },
  { meaning: UiIconMeaning.SelectAll, onClick: selectAll, title: "Select all" },
  { isGroupStart: true, meaning: UiIconMeaning.FitToContent, onClick: fitToContent, title: "Zoom to fit" },
  { meaning: UiIconMeaning.FitPage, onClick: resetZoom, title: "Reset zoom" },
];
