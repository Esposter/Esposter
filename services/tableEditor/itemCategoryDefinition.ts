import { AItemEntity } from "@/models/shared/AItemEntity";
import type { Item } from "@/models/tableEditor/Item";
import type { BaseItemCategoryDefinition, ItemCategoryDefinition } from "@/models/tableEditor/ItemCategoryDefinition";
import type { ItemEntityType } from "@/models/tableEditor/ItemEntityType";
import { TableEditorType } from "@/models/tableEditor/TableEditorType";
import { prettifyName } from "@/util/text";

class NullItem extends AItemEntity implements ItemEntityType<string> {
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

export const tableEditorItemCategoryDefinitions: BaseItemCategoryDefinition[] = [
  {
    value: TableEditorType.TodoList,
    title: prettifyName(TableEditorType.TodoList),
    icon: "mdi-check",
    targetTypeKey: "type",
  },
  {
    value: TableEditorType.VuetifyComponent,
    title: prettifyName(TableEditorType.VuetifyComponent),
    icon: "mdi-vuetify",
    targetTypeKey: "type",
  },
];

for (const icd of tableEditorItemCategoryDefinitions) {
  icd.title += " Table Editor";
}
