import type { SelectItemCategoryDefinition } from "@/models/shared/SelectItemCategoryDefinition";
import type { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import type { UiSelectItem } from "@/models/ui/UiSelectItem";

// A select holds a string, so each option carries its number as one and is read back through the list it came from
export const getNumberSelectItems = (items: SelectItemCategoryDefinition<number>[], meaning: UiIconMeaning) =>
  items.map<UiSelectItem<string>>(({ title, value }) => ({ meaning, title, value: String(value) }));
