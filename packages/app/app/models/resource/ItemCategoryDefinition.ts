import type { Item } from "#shared/models/entity/NamedItem";
import type { ListItemCategoryDefinition } from "@/models/vuetify/ListItemCategoryDefinition";
// Names the item field `value` is matched against, so a list of definitions can resolve the one
// Describing any given item rather than only rendering a type in a vuetify select or dropdown
export interface ItemCategoryDefinition<TItem extends Item = Item> extends ListItemCategoryDefinition<TItem["type"]> {
  targetTypeKey: Extract<keyof TItem, "type">;
}
