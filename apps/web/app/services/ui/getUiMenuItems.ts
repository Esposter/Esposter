import type { Item } from "@/models/shared/Item";
import type { UiMenuItem } from "@/models/ui/UiMenuItem";

import { getMenuItemValue } from "@/services/ui/getMenuItemValue";

export const getUiMenuItems = (items: Item[], parentTitle?: string): UiMenuItem<string>[] =>
  items.map(
    ({ children, description, disabled, icon, isChecked, isDanger, isGroupStart, isSelected, meaning, title }) => ({
      children: children && getUiMenuItems(children, title),
      description,
      icon,
      isChecked,
      isDanger,
      isDisabled: disabled,
      isGroupStart,
      isSelected,
      meaning,
      title,
      value: getMenuItemValue(title, parentTitle),
    }),
  );
