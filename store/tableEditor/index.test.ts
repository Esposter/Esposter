import { TodoListItem } from "@/models/tableEditor/todoList/TodoListItem";
import { ITEM_ID_QUERY_PARAM_KEY } from "@/services/tableEditor/constants";
import { useTableEditorStore } from "@/store/tableEditor";
import { useItemStore } from "@/store/tableEditor/item";
import { InvalidOperationError, Operation } from "esposter-shared";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe("Table Editor Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());

    const router = useRouter();
    router.currentRoute.value.query = {};
  });

  test("edit item", async () => {
    const router = useRouter();
    const itemStore = useItemStore();
    const { createItem } = itemStore;
    const tableEditorStore = useTableEditorStore<TodoListItem>()();
    const { editedItem, editedIndex, editFormDialog } = storeToRefs(tableEditorStore);
    const { editItem } = tableEditorStore;
    const newItem = new TodoListItem();
    createItem(newItem);

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

  test("save unedited item", async () => {
    const tableEditorStore = useTableEditorStore<TodoListItem>()();
    const { editFormDialog } = storeToRefs(tableEditorStore);
    const { save } = tableEditorStore;

    expect(editFormDialog.value).toStrictEqual(false);

    await save();

    expect(editFormDialog.value).toStrictEqual(false);
  });

  test("save new item", async () => {
    const tableEditorStore = useTableEditorStore<TodoListItem>()();
    const { tableEditor, editedItem, editFormDialog } = storeToRefs(tableEditorStore);
    const { save } = tableEditorStore;
    const newItem = new TodoListItem();
    editedItem.value = newItem;

    expect(editFormDialog.value).toStrictEqual(false);
    expect(tableEditor.value.items.length).toStrictEqual(0);

    await save();

    expect(editFormDialog.value).toStrictEqual(false);
    expect(tableEditor.value.items.length).toStrictEqual(1);
    expect(tableEditor.value.items[0]).toStrictEqual(newItem);
  });

  test("save update item", async () => {
    const tableEditorStore = useTableEditorStore<TodoListItem>()();
    const { tableEditor, editedItem, editFormDialog } = storeToRefs(tableEditorStore);
    const { editItem, save } = tableEditorStore;
    const itemStore = useItemStore();
    const { createItem } = itemStore;
    const newItem = new TodoListItem();
    const updatedName = "updatedName";
    createItem(newItem);

    expect(editFormDialog.value).toStrictEqual(false);
    expect(tableEditor.value.items[0].name).not.toStrictEqual(updatedName);

    await editItem(newItem.id);
    if (!editedItem.value) throw new InvalidOperationError(Operation.Update, editItem.name, newItem.id);
    editedItem.value.name = updatedName;
    await save();

    expect(editFormDialog.value).toStrictEqual(false);
    expect(tableEditor.value.items[0].name).toStrictEqual(updatedName);
  });

  test("save delete item", async () => {
    const tableEditorStore = useTableEditorStore<TodoListItem>()();
    const { tableEditor, editFormDialog } = storeToRefs(tableEditorStore);
    const { editItem, save } = tableEditorStore;
    const itemStore = useItemStore();
    const { createItem } = itemStore;
    const newItem = new TodoListItem();
    createItem(newItem);

    expect(editFormDialog.value).toStrictEqual(false);
    expect(tableEditor.value.items.length).toStrictEqual(1);

    await editItem(newItem.id);
    await save(true);

    expect(editFormDialog.value).toStrictEqual(false);
    expect(tableEditor.value.items.length).toStrictEqual(0);
  });

  test("reset item", async () => {
    const router = useRouter();
    const tableEditorStore = useTableEditorStore<TodoListItem>()();
    const { editedItem, editedIndex } = storeToRefs(tableEditorStore);
    const { resetItem } = tableEditorStore;

    expect(editedItem.value).toStrictEqual(null);
    expect(editedIndex.value).toStrictEqual(-1);
    expect(router.currentRoute.value.query).toStrictEqual({});

    await resetItem();

    expect(editedItem.value).toStrictEqual(null);
    expect(editedIndex.value).toStrictEqual(-1);
    expect(router.currentRoute.value.query).toStrictEqual({});
  });
});
