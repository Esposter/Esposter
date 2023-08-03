import { TableEditorType } from "@/models/tableEditor/TableEditorType";
import type { DataTableHeader } from "@/models/vuetify/DataTableHeader";
import { tableEditorHeaders } from "@/services/tableEditor/headers";
import { todoListHeaders } from "@/services/tableEditor/todoList/headers";
import { todoListItemCategoryDefinitions } from "@/services/tableEditor/todoList/itemCategoryDefinition";
import { vuetifyComponentItemCategoryDefinitions } from "@/services/tableEditor/vuetifyComponent/itemCategoryDefinition";

export const propsMap = {
  [TableEditorType.TodoList]: {
    itemCategoryDefinitions: todoListItemCategoryDefinitions,
    headers: todoListHeaders,
  },
  [TableEditorType.VuetifyComponent]: {
    itemCategoryDefinitions: vuetifyComponentItemCategoryDefinitions,
    headers: tableEditorHeaders,
  },
} satisfies Record<
  TableEditorType,
  {
    itemCategoryDefinitions: unknown[];
    headers: DataTableHeader[];
  }
>;
