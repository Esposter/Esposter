import { TableEditorType } from "@/models/tableEditor/TableEditorType";
import type { DataTableHeader } from "@/models/vuetify/DataTableHeader";
import { tableEditorHeaders } from "@/services/tableEditor/headers";
import { todoListHeaders } from "@/services/tableEditor/todoList/headers";
import { todoListItemTypeItemCategoryDefinitions } from "@/services/tableEditor/todoList/todoListItemTypeItemCategoryDefinitions";
import { vuetifyComponentItemTypeItemCategoryDefinitions } from "@/services/tableEditor/vuetifyComponent/vuetifyComponentItemTypeItemCategoryDefinitions";

export const DefaultPropsMap = {
  [TableEditorType.TodoList]: {
    itemCategoryDefinitions: todoListItemTypeItemCategoryDefinitions,
    headers: todoListHeaders,
  },
  [TableEditorType.VuetifyComponent]: {
    itemCategoryDefinitions: vuetifyComponentItemTypeItemCategoryDefinitions,
    headers: tableEditorHeaders,
  },
} as const satisfies Record<
  TableEditorType,
  {
    itemCategoryDefinitions: unknown[];
    headers: DataTableHeader[];
  }
>;
