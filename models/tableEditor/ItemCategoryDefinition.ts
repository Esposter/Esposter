import type { IItemType } from "@/models/tableEditor/IItemType";
import type { Item } from "@/models/tableEditor/Item";

export interface ItemCategoryDefinition<T extends string> {
  value: (Item & IItemType<T>)["type"];
  title: string;
  icon: string;
  targetTypeKey: Extract<keyof (Item & IItemType<T>), "type">;
  create: () => Item & IItemType<T>;
}
