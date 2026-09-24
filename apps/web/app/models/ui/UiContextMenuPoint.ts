import type { UiContextMenu } from "@/models/ui/UiContextMenu";

// Where a gesture asks the menu to open, and the element it opens for, before the items are known
export type UiContextMenuPoint = Pick<UiContextMenu, "opener" | "x" | "y">;
