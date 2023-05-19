import { AItemEntity } from "@/models/tableEditor/AItemEntity";
import type { ItemCategoryDefinition } from "@/models/tableEditor/ItemCategoryDefinition";
import type { ItemEntityType } from "@/models/tableEditor/ItemEntityType";

class NullItem extends AItemEntity implements ItemEntityType<string> {
  type = "None";
}

const NULL_ITEM_CATEGORY_DEFINITION: ItemCategoryDefinition<string> = {
  value: "None",
  title: "None",
  icon: "mdi-help",
  targetTypeKey: "type",
  create: () => new NullItem(),
};

export const getItemCategoryDefinition = <T extends string, U extends AItemEntity & ItemEntityType<T>>(
  itemCategoryDefinitions: ItemCategoryDefinition<T>[],
  item: U
) =>
  itemCategoryDefinitions.find((icd) => icd.value === item[icd.targetTypeKey as keyof U]) ??
  NULL_ITEM_CATEGORY_DEFINITION;
