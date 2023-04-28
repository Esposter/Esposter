import { AItemEntity } from "@/models/tableEditor/AItemEntity";
import type { ItemEntityType } from "@/models/tableEditor/ItemEntityType";
import { ItemType } from "@/models/tableEditor/ItemType";

export class TodoList extends AItemEntity implements ItemEntityType<ItemType> {
  type = ItemType.TodoList;
  notes = "";
}
