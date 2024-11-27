import type { Item } from "@/shared/models/tableEditor/Item";
import type { TodoListItem } from "@/shared/models/tableEditor/todoList/TodoListItem";
import type { VuetifyComponentItem } from "@/shared/models/tableEditor/vuetifyComponent/VuetifyComponentItem";
import type { RecursiveDeepOmit } from "@/util/types/RecursiveDeepOmit";

import { applyItemMetadataMixin, itemMetadataSchema } from "@/shared/models/entity/ItemMetadata";
import { Serializable } from "@/shared/models/entity/Serializable";
import { createTableEditorSchema, TableEditor } from "@/shared/models/tableEditor/TableEditor";
import { TableEditorType } from "@/shared/models/tableEditor/TableEditorType";
import { todoListItemSchema } from "@/shared/models/tableEditor/todoList/TodoListItem";
import { vuetifyComponentItemSchema } from "@/shared/models/tableEditor/vuetifyComponent/VuetifyComponentItem";
import { z } from "zod";

export type TableEditorConfiguration = typeof TableEditorConfiguration.prototype;

type TableEditorTypes = {
  [P in keyof typeof TableEditorType]: TableEditor<Item>;
};

class BaseTableEditorConfiguration extends Serializable implements TableEditorTypes {
  [TableEditorType.TodoList] = new TableEditor<TodoListItem>();
  [TableEditorType.VuetifyComponent] = new TableEditor<VuetifyComponentItem>();
}
export const TableEditorConfiguration = applyItemMetadataMixin(BaseTableEditorConfiguration);

export const tableEditorConfigurationSchema = z
  .object({
    [TableEditorType.TodoList]: createTableEditorSchema(todoListItemSchema),
    [TableEditorType.VuetifyComponent]: createTableEditorSchema(vuetifyComponentItemSchema),
  })
  // @NOTE: props type seems to be wrongly inferred as { [x: string]: {} } instead of Record<string, unknown>
  .merge(itemMetadataSchema) satisfies z.ZodType<RecursiveDeepOmit<TableEditorConfiguration, ["props", "toJSON"]>>;
