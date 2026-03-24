import type { z } from "zod";

import { TableEditorType } from "#shared/models/tableEditor/data/TableEditorType";
import { dataSourceItemSchema } from "#shared/models/tableEditor/file/datasource/DataSourceItemSchema";
import { todoListItemSchema } from "#shared/models/tableEditor/todoList/TodoListItem";
import { vuetifyComponentItemSchema } from "#shared/models/tableEditor/vuetifyComponent/VuetifyComponentItem";

export const TableEditorTypeItemSchemaMap = {
  [TableEditorType.File]: dataSourceItemSchema,
  [TableEditorType.TodoList]: todoListItemSchema,
  [TableEditorType.VuetifyComponent]: vuetifyComponentItemSchema,
} as const satisfies Record<TableEditorType, z.ZodType>;
