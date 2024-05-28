import type { ItemEntityType } from "@/models/shared/entity/ItemEntityType";
import { ATableEditorItemEntity } from "@/models/tableEditor/ATableEditorItemEntity";
import type { Item } from "@/models/tableEditor/Item";
import type { ItemCategoryDefinition } from "@/models/tableEditor/ItemCategoryDefinition";

class NullItem extends ATableEditorItemEntity implements ItemEntityType<string> {
  type = "None";
}

const NULL_ITEM_CATEGORY_DEFINITION: ItemCategoryDefinition = {
  value: "None",
  title: "None",
  icon: "mdi-help",
  targetTypeKey: "type",
  create: () => new NullItem(),
};

export const getItemCategoryDefinition = <TItem extends Item>(
  itemCategoryDefinitions: ItemCategoryDefinition<TItem>[],
  item: TItem,
) => itemCategoryDefinitions.find((icd) => icd.value === item[icd.targetTypeKey]) ?? NULL_ITEM_CATEGORY_DEFINITION;
