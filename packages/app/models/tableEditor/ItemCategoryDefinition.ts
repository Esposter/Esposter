import type { Item } from "@/models/tableEditor/Item";
import type { ListItemCategoryDefinition } from "@/models/vuetify/ListItemCategoryDefinition";

// Some items need the functionality to be able to create a new item
// instead of just showing a type in a vuetify select or dropdown
export interface ItemCategoryDefinition<TItem extends Item = Item> extends ListItemCategoryDefinition<TItem["type"]> {
  targetTypeKey: Extract<keyof TItem, "type">;
  create: () => TItem;
}
