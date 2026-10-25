import type { UiContextMenuPoint } from "@/models/ui/UiContextMenuPoint";

// A touch press waiting out its long press, and the handler that opens the menu at the point it was pressed
export type UiContextMenuPress = UiContextMenuPoint & { onOpen: (point: UiContextMenuPoint) => void };
