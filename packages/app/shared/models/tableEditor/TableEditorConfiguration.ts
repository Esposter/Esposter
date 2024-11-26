import type { TodoListItem } from "@/models/tableEditor/todoList/TodoListItem";
import type { Item } from "@/shared/models/tableEditor/Item";
import type { VuetifyComponentItem } from "@/shared/models/tableEditor/vuetifyComponent/VuetifyComponentItem";
import type { Except } from "type-fest";

import { todoListItemSchema } from "@/models/tableEditor/todoList/TodoListItem";
import { applyItemMetadataMixin, itemMetadataSchema } from "@/shared/models/entity/ItemMetadata";
import { createTableEditorSchema, TableEditor } from "@/shared/models/tableEditor/TableEditor";
import { TableEditorType } from "@/shared/models/tableEditor/TableEditorType";
import { vuetifyComponentItemSchema } from "@/shared/models/tableEditor/vuetifyComponent/VuetifyComponentItem";
import { z } from "zod";

export type TableEditorConfiguration = typeof TableEditorConfiguration.prototype;

type TableEditorTypes = {
  [P in keyof typeof TableEditorType]: TableEditor<Item>;
};

class BaseTableEditorConfiguration implements TableEditorTypes {
  [TableEditorType.TodoList] = new TableEditor<TodoListItem>();
  [TableEditorType.VuetifyComponent] = new TableEditor<VuetifyComponentItem>();

  toJSON() {
    return JSON.stringify({ ...this });
  }
}
export const TableEditorConfiguration = applyItemMetadataMixin(BaseTableEditorConfiguration);

export const tableEditorConfigurationSchema = z
  .object({
    [TableEditorType.TodoList]: createTableEditorSchema(todoListItemSchema),
    [TableEditorType.VuetifyComponent]: createTableEditorSchema(vuetifyComponentItemSchema),
  })
  .merge(itemMetadataSchema) satisfies z.ZodType<Except<TableEditorConfiguration, "toJSON">>;
