import type { Item } from "@/models/tableEditor/Item";

export interface BaseItemCategoryDefinition<TItem extends Item = Item> {
  value: TItem["type"];
  title: string;
  icon: string;
  targetTypeKey: Extract<keyof TItem, "type">;
}

// Some items need the functionality to be able to create a new item
// instead of just showing a type in a vuetify select or dropdown
export interface ItemCategoryDefinition<TItem extends Item = Item> extends BaseItemCategoryDefinition<TItem> {
  create: () => TItem;
}
