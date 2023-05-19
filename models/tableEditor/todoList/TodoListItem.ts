import { AItemEntity } from "@/models/tableEditor/AItemEntity";
import type { ItemEntityType } from "@/models/tableEditor/ItemEntityType";
import { TodoListItemType } from "@/models/tableEditor/todoList/TodoListItemType";

export class TodoListItem extends AItemEntity implements ItemEntityType<TodoListItemType> {
  type = TodoListItemType.TodoList;
  notes = "";
}
