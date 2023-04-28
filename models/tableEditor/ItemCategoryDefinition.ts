import type { AItemEntity } from "@/models/tableEditor/AItemEntity";
import type { ItemEntityType } from "@/models/tableEditor/ItemEntityType";

export interface ItemCategoryDefinition<T extends string> {
  value: (AItemEntity & ItemEntityType<T>)["type"];
  title: string;
  icon: string;
  targetTypeKey: Extract<keyof (AItemEntity & ItemEntityType<T>), "type">;
  create: () => AItemEntity & ItemEntityType<T>;
}
