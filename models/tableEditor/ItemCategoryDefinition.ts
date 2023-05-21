import type { AItemEntity } from "@/models/tableEditor/AItemEntity";
import type { ItemEntityType } from "@/models/tableEditor/ItemEntityType";

export interface ItemCategoryDefinition<
  T extends string,
  TItem extends AItemEntity & ItemEntityType<T> = AItemEntity & ItemEntityType<T>
> {
  value: TItem["type"];
  title: string;
  icon: string;
  targetTypeKey: Extract<keyof TItem, "type">;
  create: () => TItem;
}
