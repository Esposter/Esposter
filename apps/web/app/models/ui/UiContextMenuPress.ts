import type { UiContextMenuPoint } from "#src/models/ui/UiContextMenuPoint";

// A touch press waiting out its long press, and the handler that opens the menu at the point it was pressed
export type UiContextMenuPress = UiContextMenuPoint & {
  onOpen: (point: UiContextMenuPoint, isFromPointer: boolean) => void;
};
