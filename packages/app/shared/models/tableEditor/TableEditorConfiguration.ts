import type { ToData } from "#shared/models/entity/ToData";
import type { Item } from "#shared/models/tableEditor/Item";
import type { TodoListItem } from "#shared/models/tableEditor/todoList/TodoListItem";
import type { VuetifyComponentItem } from "#shared/models/tableEditor/vuetifyComponent/VuetifyComponentItem";

import { AItemEntity, aItemEntitySchema } from "#shared/models/entity/AItemEntity";
import { createTableEditorSchema, TableEditor } from "#shared/models/tableEditor/TableEditor";
import { TableEditorType } from "#shared/models/tableEditor/TableEditorType";
import { todoListItemSchema } from "#shared/models/tableEditor/todoList/TodoListItem";
import { vuetifyComponentItemSchema } from "#shared/models/tableEditor/vuetifyComponent/VuetifyComponentItem";
import { z } from "zod";

type TableEditorTypes = {
  [P in keyof typeof TableEditorType]: TableEditor<Item>;
};

export class TableEditorConfiguration extends AItemEntity implements TableEditorTypes {
  [TableEditorType.TodoList] = new TableEditor<TodoListItem>();
  [TableEditorType.VuetifyComponent] = new TableEditor<VuetifyComponentItem>();
}

export const tableEditorConfigurationSchema = z
  .object({
    [TableEditorType.TodoList]: createTableEditorSchema(todoListItemSchema),
    [TableEditorType.VuetifyComponent]: createTableEditorSchema(vuetifyComponentItemSchema),
  })
  .merge(aItemEntitySchema) satisfies z.ZodType<ToData<TableEditorConfiguration>>;
