import type { UiItem } from "@/models/ui/UiItem";
import type { UiMenuItem } from "@/models/ui/UiMenuItem";

// An item's title is unique within its menu, so it is the value the menu hands back, and an item in the error colour
// Is one that destroys what it acts on
export const getUiMenuItems = (items: UiItem[]): UiMenuItem<string>[] =>
  items.map(({ color, disabled, icon, isGroupStart, meaning, title }) => ({
    icon,
    isDanger: color === "error",
    isDisabled: disabled,
    isGroupStart,
    meaning,
    title,
    value: title,
  }));
