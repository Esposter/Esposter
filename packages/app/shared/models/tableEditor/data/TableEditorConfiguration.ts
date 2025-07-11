import type { ToData } from "#shared/models/entity/ToData";
import type { Item } from "#shared/models/tableEditor/data/Item";
import type { TodoListItem } from "#shared/models/tableEditor/todoList/TodoListItem";
import type { VuetifyComponentItem } from "#shared/models/tableEditor/vuetifyComponent/VuetifyComponentItem";
import type { PartialDeep } from "type-fest";

import { AItemEntity, aItemEntitySchema } from "#shared/models/entity/AItemEntity";
import { createTableEditorSchema, TableEditor } from "#shared/models/tableEditor/data/TableEditor";
import { TableEditorType } from "#shared/models/tableEditor/data/TableEditorType";
import { todoListItemSchema } from "#shared/models/tableEditor/todoList/TodoListItem";
import { vuetifyComponentItemSchema } from "#shared/models/tableEditor/vuetifyComponent/VuetifyComponentItem";
import { z } from "zod";

type TableEditorTypes = {
  [P in keyof typeof TableEditorType]: TableEditor<Item>;
};

export class TableEditorConfiguration extends AItemEntity implements TableEditorTypes {
  [TableEditorType.TodoList] = new TableEditor<TodoListItem>();
  [TableEditorType.VuetifyComponent] = new TableEditor<VuetifyComponentItem>();

  constructor(init?: PartialDeep<TableEditorConfiguration>) {
    super();
    Object.assign(this, init, {
      [TableEditorType.TodoList]: new TableEditor(init?.[TableEditorType.TodoList]),
      [TableEditorType.VuetifyComponent]: new TableEditor(init?.[TableEditorType.VuetifyComponent]),
    });
  }
}

export const tableEditorConfigurationSchema = z.object({
  ...aItemEntitySchema.shape,
  [TableEditorType.TodoList]: createTableEditorSchema(todoListItemSchema),
  [TableEditorType.VuetifyComponent]: createTableEditorSchema(vuetifyComponentItemSchema),
}) satisfies z.ZodType<ToData<TableEditorConfiguration>>;
