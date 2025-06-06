import { TableEditorType } from "#shared/models/tableEditor/data/TableEditorType";
import { TableEditorHeaders } from "@/services/tableEditor/TableEditorHeaders";
import { TodoListHeaders } from "@/services/tableEditor/todoList/TodoListHeaders";
import { TodoListItemTypeItemCategoryDefinitions } from "@/services/tableEditor/todoList/TodoListItemTypeItemCategoryDefinitions";
import { VuetifyComponentItemTypeItemCategoryDefinitions } from "@/services/tableEditor/vuetifyComponent/VuetifyComponentItemTypeItemCategoryDefinitions";

export const DefaultPropsMap = {
  [TableEditorType.TodoList]: {
    headers: TodoListHeaders,
    itemCategoryDefinitions: TodoListItemTypeItemCategoryDefinitions,
  },
  [TableEditorType.VuetifyComponent]: {
    headers: TableEditorHeaders,
    itemCategoryDefinitions: VuetifyComponentItemTypeItemCategoryDefinitions,
  },
} as const satisfies Record<
  TableEditorType,
  {
    headers: unknown[];
    itemCategoryDefinitions: unknown[];
  }
>;
