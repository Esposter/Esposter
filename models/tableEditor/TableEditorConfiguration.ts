import { AItemEntity, aItemEntitySchema } from "@/models/shared/AItemEntity";
import { Item } from "@/models/tableEditor/Item";
import { ItemEntityType, createItemEntityTypeSchema } from "@/models/tableEditor/ItemEntityType";
import { TableEditor, createTableEditorSchema } from "@/models/tableEditor/TableEditor";
import { TableEditorType } from "@/models/tableEditor/TableEditorType";
import { TodoListItemType, todoListItemTypeSchema } from "@/models/tableEditor/todoList/TodoListItemType";
import {
  VuetifyComponentItemType,
  vuetifyComponentItemTypeSchema,
} from "@/models/tableEditor/vuetifyComponent/VuetifyComponentItemType";
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

export const tableEditorConfigurationSchema = z.object({
  [TableEditorType.TodoList]: createTableEditorSchema(
    aItemEntitySchema.merge(createItemEntityTypeSchema(todoListItemTypeSchema)),
  ),
  [TableEditorType.VuetifyComponent]: createTableEditorSchema(
    aItemEntitySchema.merge(createItemEntityTypeSchema(vuetifyComponentItemTypeSchema)),
  ),
}) satisfies z.ZodType<Omit<TableEditorConfiguration, "toJSON">>;
