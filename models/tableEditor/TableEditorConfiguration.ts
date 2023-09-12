import { AItemEntity } from "@/models/shared/AItemEntity";
import { Item } from "@/models/tableEditor/Item";
import { ItemEntityType } from "@/models/tableEditor/ItemEntityType";
import { TableEditor, createTableEditorSchema } from "@/models/tableEditor/TableEditor";
import { TableEditorType } from "@/models/tableEditor/TableEditorType";
import { todoListItemSchema } from "@/models/tableEditor/todoList/TodoListItem";
import { TodoListItemType } from "@/models/tableEditor/todoList/TodoListItemType";
import { vuetifyComponentItemSchema } from "@/models/tableEditor/vuetifyComponent/VuetifyComponentItem";
import { VuetifyComponentItemType } from "@/models/tableEditor/vuetifyComponent/VuetifyComponentItemType";
import { RegisterSuperJSON } from "@/services/superjson/RegisterSuperJSON";
import { z } from "zod";

type TableEditorTypes = {
  [Property in keyof typeof TableEditorType]: TableEditor<Item>;
};

export class TableEditorConfiguration implements TableEditorTypes {
  [TableEditorType.TodoList] = new TableEditor<AItemEntity & ItemEntityType<TodoListItemType>>();
  [TableEditorType.VuetifyComponent] = new TableEditor<AItemEntity & ItemEntityType<VuetifyComponentItemType>>();

  constructor(init?: Partial<TableEditorConfiguration>) {
    Object.assign(this, init);
  }

  toJSON() {
    return JSON.stringify({ ...this });
  }
}

// Change this to use class decorators when it is supported
// https://github.com/nuxt/nuxt/issues/14126
RegisterSuperJSON(TableEditorConfiguration);

export const tableEditorConfigurationSchema = z.object({
  [TableEditorType.TodoList]: createTableEditorSchema(todoListItemSchema),
  [TableEditorType.VuetifyComponent]: createTableEditorSchema(vuetifyComponentItemSchema),
}) satisfies z.ZodType<Omit<TableEditorConfiguration, "toJSON">>;
