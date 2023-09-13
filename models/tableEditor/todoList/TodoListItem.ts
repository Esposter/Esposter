import { AItemEntity, aItemEntitySchema } from "@/models/shared/AItemEntity";
import { createItemEntityTypeSchema, type ItemEntityType } from "@/models/tableEditor/ItemEntityType";
import { TodoListItemType, todoListItemTypeSchema } from "@/models/tableEditor/todoList/TodoListItemType";

export class TodoListItem extends AItemEntity implements ItemEntityType<TodoListItemType> {
  type = TodoListItemType.Todo;
  notes = "";
}
