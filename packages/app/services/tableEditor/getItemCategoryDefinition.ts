import type { ItemCategoryDefinition } from "@/models/tableEditor/ItemCategoryDefinition";
import type { ItemEntityType } from "@/shared/models/entity/ItemEntityType";
import type { Item } from "@/shared/models/tableEditor/Item";

import { ATableEditorItemEntity } from "@/shared/models/tableEditor/ATableEditorItemEntity";

class NullItem extends ATableEditorItemEntity implements ItemEntityType<string> {
  type = "None";
}

const NULL_ITEM_CATEGORY_DEFINITION: ItemCategoryDefinition = {
  create: () => new NullItem(),
  icon: "mdi-help",
  targetTypeKey: "type",
  title: "None",
  value: "None",
};

export const getItemCategoryDefinition = <TItem extends Item>(
  itemCategoryDefinitions: TItem extends TItem ? ItemCategoryDefinition<TItem>[] : never,
  item: TItem,
) => itemCategoryDefinitions.find((icd) => icd.value === item[icd.targetTypeKey]) ?? NULL_ITEM_CATEGORY_DEFINITION;
