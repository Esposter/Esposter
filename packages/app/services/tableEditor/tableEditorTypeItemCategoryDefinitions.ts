import { TableEditorType } from "@/models/tableEditor/TableEditorType";
import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";
import { getTableEditorTitle } from "@/services/tableEditor/getTableEditorTitle";

export const tableEditorTypeItemCategoryDefinitions: SelectItemCategoryDefinition<TableEditorType>[] = [
  {
    value: TableEditorType.TodoList,
    title: getTableEditorTitle(TableEditorType.TodoList),
  },
  {
    value: TableEditorType.VuetifyComponent,
    title: getTableEditorTitle(TableEditorType.VuetifyComponent),
  },
];
