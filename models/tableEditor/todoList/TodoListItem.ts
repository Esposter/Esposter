import { AItemEntity, aItemEntitySchema } from "@/models/shared/AItemEntity";
import { createItemEntityTypeSchema, type ItemEntityType } from "@/models/tableEditor/ItemEntityType";
import { TodoListItemType, todoListItemTypeSchema } from "@/models/tableEditor/todoList/TodoListItemType";
import { RegisterSuperJSON } from "@/services/superjson/RegisterSuperJSON";

export class TodoListItem extends AItemEntity implements ItemEntityType<TodoListItemType> {
  type = TodoListItemType.Todo;
  notes = "";
}

export const todoListItemSchema = aItemEntitySchema.merge(createItemEntityTypeSchema(todoListItemTypeSchema));

// Change this to use class decorators when it is supported
// https://github.com/nuxt/nuxt/issues/14126
RegisterSuperJSON(TodoListItem);
