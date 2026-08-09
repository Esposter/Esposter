import type { Item } from "#shared/models/entity/NamedItem";
import type { ItemCategoryDefinition } from "@/models/resource/ItemCategoryDefinition";
import type { ItemEntityType } from "@esposter/shared";

import { ANamedItemEntity } from "#shared/models/entity/ANamedItemEntity";
import { ItemEntityTypePropertyNames } from "@esposter/shared";

class NullItem extends ANamedItemEntity implements ItemEntityType<"None"> {
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
) =>
  itemCategoryDefinitions.find(
    (itemCategoryDefinition) => itemCategoryDefinition.value === item[itemCategoryDefinition.targetTypeKey],
  ) ?? NULL_ITEM_CATEGORY_DEFINITION;
