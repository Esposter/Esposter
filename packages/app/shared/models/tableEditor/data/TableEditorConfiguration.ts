import type { Item } from "#shared/models/tableEditor/data/Item";
import type { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";
import type { TodoListItem } from "#shared/models/tableEditor/todoList/TodoListItem";
import type { VuetifyComponentItem } from "#shared/models/tableEditor/vuetifyComponent/VuetifyComponentItem";
import type { ToData } from "@esposter/shared";
import type { PartialDeep } from "type-fest";

import { AItemEntity, aItemEntitySchema } from "#shared/models/entity/AItemEntity";
import { createTableEditorSchema, TableEditor } from "#shared/models/tableEditor/data/TableEditor";
import { TableEditorType } from "#shared/models/tableEditor/data/TableEditorType";
import { ADataSourceItem } from "#shared/models/tableEditor/file/ADataSourceItem";
import { dataSourceItemSchema } from "#shared/models/tableEditor/file/DataSourceItemSchema";
import { todoListItemSchema } from "#shared/models/tableEditor/todoList/TodoListItem";
import { vuetifyComponentItemSchema } from "#shared/models/tableEditor/vuetifyComponent/VuetifyComponentItem";
import { z } from "zod";

type TableEditorTypes = Record<keyof typeof TableEditorType, TableEditor<Item>>;

export class TableEditorConfiguration extends AItemEntity implements TableEditorTypes {
  [TableEditorType.File] = new TableEditor<ADataSourceItem<DataSourceType>>();
  [TableEditorType.TodoList] = new TableEditor<TodoListItem>();
  [TableEditorType.VuetifyComponent] = new TableEditor<VuetifyComponentItem>();

  constructor(init?: PartialDeep<TableEditorConfiguration>) {
    super();
    Object.assign(this, init, {
      [TableEditorType.File]: new TableEditor(init?.[TableEditorType.File]),
      [TableEditorType.TodoList]: new TableEditor(init?.[TableEditorType.TodoList]),
      [TableEditorType.VuetifyComponent]: new TableEditor(init?.[TableEditorType.VuetifyComponent]),
    });
  }
}

export const tableEditorConfigurationSchema = z.object({
  ...aItemEntitySchema.shape,
  [TableEditorType.File]: createTableEditorSchema(dataSourceItemSchema),
  [TableEditorType.TodoList]: createTableEditorSchema(todoListItemSchema),
  [TableEditorType.VuetifyComponent]: createTableEditorSchema(vuetifyComponentItemSchema),
}) satisfies z.ZodType<ToData<TableEditorConfiguration>>;
