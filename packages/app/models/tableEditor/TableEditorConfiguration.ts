import type { Item } from "@/models/tableEditor/Item";
import type { TodoListItem } from "@/models/tableEditor/todoList/TodoListItem";
import type { VuetifyComponentItem } from "@/models/tableEditor/vuetifyComponent/VuetifyComponentItem";
import type { Except } from "type-fest";

import { createTableEditorSchema, TableEditor } from "@/models/tableEditor/TableEditor";
import { TableEditorType } from "@/models/tableEditor/TableEditorType";
import { todoListItemSchema } from "@/models/tableEditor/todoList/TodoListItem";
import { vuetifyComponentItemSchema } from "@/models/tableEditor/vuetifyComponent/VuetifyComponentItem";
import { applyItemMetadataMixin, itemMetadataSchema } from "@/shared/models/itemMetadata";
import { z } from "zod";

type TableEditorTypes = {
  [P in keyof typeof TableEditorType]: TableEditor<Item>;
};

export class BaseTableEditorConfiguration implements TableEditorTypes {
  [TableEditorType.TodoList] = new TableEditor<TodoListItem>();
  [TableEditorType.VuetifyComponent] = new TableEditor<VuetifyComponentItem>();

  toJSON() {
    return JSON.stringify({ ...this });
  }
}

export type TableEditorConfiguration = typeof TableEditorConfiguration.prototype;
export const TableEditorConfiguration = applyItemMetadataMixin(BaseTableEditorConfiguration);

export const tableEditorConfigurationSchema = z
  .object({
    [TableEditorType.TodoList]: createTableEditorSchema(todoListItemSchema),
    [TableEditorType.VuetifyComponent]: createTableEditorSchema(vuetifyComponentItemSchema),
  })
  .merge(itemMetadataSchema) satisfies z.ZodType<Except<TableEditorConfiguration, "toJSON">>;
