import { TodoListItem } from "@/models/tableEditor/todoList/TodoListItem";
import { useTableEditorStore } from "@/store/tableEditor";
import { useItemStore } from "@/store/tableEditor/item";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe("Table Editor Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const itemStore = useItemStore();
    const { initialiseItemList } = itemStore;
    const newItem = new TodoListItem();

    initialiseItemList([newItem]);
  });

  test("edit item", () => {
    const tableEditorStore = useTableEditorStore<TodoListItem>()();
    const { editedItem, editedIndex } = storeToRefs(tableEditorStore);
    // const { editItem } = tableEditorStore;
    // const newItem = tableEditor.value.items[0];

    expect(editedItem.value).toStrictEqual(null);
    expect(editedIndex.value).toStrictEqual(-1);
    // @TODO: Could not find Vuetify theme injection
    // editItem(newItem.id);
    // expect(editedItem.value).toEqual(newItem);
    // expect(editedIndex.value).toStrictEqual(0);
  });
});
