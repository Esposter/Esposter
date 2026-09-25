import type { Item } from "@/models/shared/Item";
import type { UiMenuItem } from "@/models/ui/UiMenuItem";

// An item's title is unique within its menu, so it is the value the menu hands back
export const getUiMenuItems = (items: Item[]): UiMenuItem<string>[] =>
  items.map(({ disabled, icon, isDanger, isGroupStart, meaning, title }) => ({
    icon,
    isDanger,
    isDisabled: disabled,
    isGroupStart,
    meaning,
    title,
    value: title,
  }));
