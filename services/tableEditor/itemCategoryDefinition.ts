import type { IItemType } from "@/models/tableEditor/IItemType";
import { Item } from "@/models/tableEditor/Item";
import { ItemCategoryDefinition } from "@/models/tableEditor/ItemCategoryDefinition";
import { ItemType } from "@/models/tableEditor/ItemType";
import { VuetifyComponent } from "@/models/tableEditor/vuetifyComponent/VuetifyComponent";

export const tableEditorItemCategoryDefinitions: ItemCategoryDefinition<ItemType>[] = [
  {
    value: ItemType.VuetifyComponent,
    title: prettifyName(ItemType.VuetifyComponent),
    icon: "mdi-vuetify",
    targetTypeKey: "type",
    create: () => new VuetifyComponent(),
  },
];

class NullItem extends Item implements IItemType<string> {
  type = "None";
}

const NULL_ITEM_CATEGORY_DEFINITION: ItemCategoryDefinition<string> = {
  value: "None",
  title: "None",
  icon: "mdi-help",
  targetTypeKey: "type",
  create: () => new NullItem(),
};

export const getItemCategoryDefinition = <T extends string, U extends Item & IItemType<T>>(
  itemCategoryDefinitions: ItemCategoryDefinition<T>[],
  item: U | null
) => {
  if (!item) return NULL_ITEM_CATEGORY_DEFINITION;
  return (
    itemCategoryDefinitions.find((icd) => icd.value === item[icd.targetTypeKey as keyof U]) ??
    NULL_ITEM_CATEGORY_DEFINITION
  );
};
