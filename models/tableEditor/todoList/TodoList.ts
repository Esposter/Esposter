import type { IItemType } from "@/models/tableEditor/IItemType";
import { Item } from "@/models/tableEditor/Item";
import { ItemType } from "@/models/tableEditor/ItemType";

export class TodoList extends Item implements IItemType<ItemType> {
  type = ItemType.TodoList;
  notes = "";
}
