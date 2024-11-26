import type { DataTableHeader } from "@/models/vuetify/DataTableHeader";

import { tableEditorHeaders } from "@/services/tableEditor/headers";
import { todoListHeaders } from "@/services/tableEditor/todoList/headers";
import { todoListItemTypeItemCategoryDefinitions } from "@/services/tableEditor/todoList/todoListItemTypeItemCategoryDefinitions";
import { vuetifyComponentItemTypeItemCategoryDefinitions } from "@/services/tableEditor/vuetifyComponent/vuetifyComponentItemTypeItemCategoryDefinitions";
import { TableEditorType } from "@/shared/models/tableEditor/TableEditorType";

export const DefaultPropsMap = {
  [TableEditorType.TodoList]: {
    headers: todoListHeaders,
    itemCategoryDefinitions: todoListItemTypeItemCategoryDefinitions,
  },
  [TableEditorType.VuetifyComponent]: {
    headers: tableEditorHeaders,
    itemCategoryDefinitions: vuetifyComponentItemTypeItemCategoryDefinitions,
  },
} as const satisfies Record<
  TableEditorType,
  {
    headers: DataTableHeader[];
    itemCategoryDefinitions: unknown[];
  }
>;
