import type { Item } from "@/models/tableEditor/Item";

export interface ItemCategoryDefinition<TItem extends Item = Item> {
  value: TItem["type"];
  title: string;
  icon: string;
  targetTypeKey: Extract<keyof TItem, "type">;
  create: () => TItem;
}
