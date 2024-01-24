import { type Item } from "@/models/tableEditor/Item";
import { TableEditor, createTableEditorSchema } from "@/models/tableEditor/TableEditor";
import { TableEditorType } from "@/models/tableEditor/TableEditorType";
import { todoListItemSchema, type TodoListItem } from "@/models/tableEditor/todoList/TodoListItem";
import {
  vuetifyComponentItemSchema,
  type VuetifyComponentItem,
} from "@/models/tableEditor/vuetifyComponent/VuetifyComponentItem";
import { type Except } from "@/util/types/Except";
import { z } from "zod";

type TableEditorTypes = {
  [Property in keyof typeof TableEditorType]: TableEditor<Item>;
};

export class TableEditorConfiguration implements TableEditorTypes {
  [TableEditorType.TodoList] = new TableEditor<TodoListItem>();
  [TableEditorType.VuetifyComponent] = new TableEditor<VuetifyComponentItem>();

  constructor(init?: Partial<TableEditorConfiguration>) {
    Object.assign(this, init);
  }

  toJSON() {
    return JSON.stringify({ ...this });
  }
}

export const tableEditorConfigurationSchema = z.object({
  [TableEditorType.TodoList]: createTableEditorSchema(todoListItemSchema),
  [TableEditorType.VuetifyComponent]: createTableEditorSchema(vuetifyComponentItemSchema),
}) satisfies z.ZodType<Except<TableEditorConfiguration, "toJSON">>;
