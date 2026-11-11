import type { Item } from "@/models/shared/Item";

import { getMenuItemValue } from "@/services/ui/getMenuItemValue";

// The item a menu's chosen value names, whether it is one of the list or one of a group's children
export const getMenuItemByValue = (items: Item[], value: string): Item | undefined => {
  for (const item of items) {
    if (getMenuItemValue(item.title) === value) return item;
    const child = item.children?.find(({ title }) => getMenuItemValue(title, item.title) === value);
    if (child) return child;
  }
};
