import type { Item } from "#shared/models/tableEditor/data/Item";
import type { ItemCategoryDefinition } from "@/models/tableEditor/ItemCategoryDefinition";
import type { ItemEntityType } from "@esposter/shared";

import { ATableEditorItemEntity } from "#shared/models/tableEditor/data/ATableEditorItemEntity";
import { ItemEntityTypePropertyNames } from "@esposter/shared";

class NullItem extends ATableEditorItemEntity implements ItemEntityType<"None"> {
  type = "None" as const;
}

const NULL_ITEM_CATEGORY_DEFINITION: ItemCategoryDefinition<NullItem> = {
  create: () => new NullItem(),
  icon: "mdi-help",
  targetTypeKey: ItemEntityTypePropertyNames.type,
  title: "None",
  value: "None",
};

export const getItemCategoryDefinition = <TItem extends Item>(
  itemCategoryDefinitions: TItem extends TItem ? ItemCategoryDefinition<TItem>[] : never,
  item: TItem,
) => itemCategoryDefinitions.find((icd) => icd.value === item[icd.targetTypeKey]) ?? NULL_ITEM_CATEGORY_DEFINITION;
