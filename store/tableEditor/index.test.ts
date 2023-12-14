import { TodoListItem } from "@/models/tableEditor/todoList/TodoListItem";
import { ITEM_ID_QUERY_PARAM_KEY } from "@/services/tableEditor/constants";
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

  test("edit item", async () => {
    const router = useRouter();
    const tableEditorStore = useTableEditorStore<TodoListItem>()();
    const { tableEditor, editedItem, editedIndex, editFormDialog } = storeToRefs(tableEditorStore);
    const { editItem } = tableEditorStore;
    const newItem = tableEditor.value.items[0];

    expect(editedItem.value).toStrictEqual(null);
    expect(editedIndex.value).toStrictEqual(-1);
    expect(editFormDialog.value).toStrictEqual(false);
    expect(router.currentRoute.value.query).toStrictEqual({});

    await editItem(newItem.id);
    // The edited item will be a structured clone of the original item class
    // object !== class (not strictly equal)
    expect(editedItem.value).toEqual(newItem);
    expect(editedIndex.value).toStrictEqual(0);
    expect(editFormDialog.value).toStrictEqual(true);
    expect(router.currentRoute.value.query).toStrictEqual({ [ITEM_ID_QUERY_PARAM_KEY]: newItem.id });
  });
});
