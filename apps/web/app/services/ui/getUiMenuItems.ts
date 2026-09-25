import type { Item } from "@/models/shared/Item";
import type { UiMenuItem } from "@/models/ui/UiMenuItem";

// An item's title is unique within its menu, so it is the value the menu hands back, and an item in the error colour
// Is one that destroys what it acts on
export const getUiMenuItems = (items: Item[]): UiMenuItem<string>[] =>
  items.map(({ color, disabled, icon, isGroupStart, meaning, title }) => ({
    icon,
    isDanger: color === "error",
    isDisabled: disabled,
    isGroupStart,
    meaning,
    title,
    value: title,
  }));
