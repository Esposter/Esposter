import { TodoListItem } from "@/models/tableEditor/todoList/TodoListItem";
import { ITEM_ID_QUERY_PARAM_KEY } from "@/services/shared/constants";
import { useTableEditorStore } from "@/store/tableEditor";
import { useItemStore } from "@/store/tableEditor/item";
import { expectToBeDefined } from "@/util/test/expectToBeDefined";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe("tableEditorStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());

    const router = useRouter();
    router.currentRoute.value.query = {};
  });

  test("edit item", async () => {
    expect.hasAssertions();

    const router = useRouter();
    const itemStore = useItemStore();
    const { createItem } = itemStore;
    const tableEditorStore = useTableEditorStore<TodoListItem>();
    const { editedIndex, editedItem, editFormDialog } = storeToRefs(tableEditorStore);
    const { editItem } = tableEditorStore;
    const newItem = new TodoListItem();
    createItem(newItem);

    expect(editedItem.value).toBeNull();
    expect(editedIndex.value).toBe(-1);
    expect(editFormDialog.value).toBeFalsy();
    expect(router.currentRoute.value.query).toStrictEqual({});

    await editItem(newItem.id);

    // The edited item will be a structured clone object of the original item class
    // object !== class (not strictly equal)
    // eslint-disable-next-line vitest/prefer-strict-equal
    expect(editedItem.value).toEqual(newItem);
    expect(editedIndex.value).toBe(0);
    expect(editFormDialog.value).toBeTruthy();
    expect(router.currentRoute.value.query).toStrictEqual({ [ITEM_ID_QUERY_PARAM_KEY]: newItem.id });
  });

  test("save unedited item", async () => {
    expect.hasAssertions();

    const tableEditorStore = useTableEditorStore<TodoListItem>();
    const { editFormDialog } = storeToRefs(tableEditorStore);
    const { save } = tableEditorStore;

    expect(editFormDialog.value).toBeFalsy();

    await save();

    expect(editFormDialog.value).toBeFalsy();
  });

  test("save new item", async () => {
    expect.hasAssertions();

    const tableEditorStore = useTableEditorStore<TodoListItem>();
    const { editedItem, editFormDialog, tableEditor } = storeToRefs(tableEditorStore);
    const { save } = tableEditorStore;
    const newItem = new TodoListItem();
    editedItem.value = newItem;

    expect(editFormDialog.value).toBeFalsy();
    expect(tableEditor.value.items).toHaveLength(0);

    await save();

    expect(editFormDialog.value).toBeFalsy();
    expect(tableEditor.value.items).toHaveLength(1);
    expect(tableEditor.value.items[0]).toStrictEqual(newItem);
  });

  test("save update item", async () => {
    expect.hasAssertions();

    const tableEditorStore = useTableEditorStore<TodoListItem>();
    const { editedItem, editFormDialog, tableEditor } = storeToRefs(tableEditorStore);
    const { editItem, save } = tableEditorStore;
    const itemStore = useItemStore();
    const { createItem } = itemStore;
    const newItem = new TodoListItem();
    const updatedName = "updatedName";
    createItem(newItem);

    expect(editFormDialog.value).toBeFalsy();
    expect(tableEditor.value.items[0].name).not.toStrictEqual(updatedName);

    await editItem(newItem.id);
    expectToBeDefined(editedItem.value);
    editedItem.value.name = updatedName;
    await save();

    expect(editFormDialog.value).toBeFalsy();
    expect(tableEditor.value.items[0].name).toStrictEqual(updatedName);
  });

  test("save delete item", async () => {
    expect.hasAssertions();

    const tableEditorStore = useTableEditorStore<TodoListItem>();
    const { editFormDialog, tableEditor } = storeToRefs(tableEditorStore);
    const { editItem, save } = tableEditorStore;
    const itemStore = useItemStore();
    const { createItem } = itemStore;
    const newItem = new TodoListItem();
    createItem(newItem);

    expect(editFormDialog.value).toBeFalsy();
    expect(tableEditor.value.items).toHaveLength(1);

    await editItem(newItem.id);
    await save(true);

    expect(editFormDialog.value).toBeFalsy();
    expect(tableEditor.value.items).toHaveLength(0);
  });

  test("reset item", async () => {
    expect.hasAssertions();

    const router = useRouter();
    const tableEditorStore = useTableEditorStore<TodoListItem>();
    const { editedIndex, editedItem } = storeToRefs(tableEditorStore);
    const { resetItem } = tableEditorStore;

    expect(editedItem.value).toBeNull();
    expect(editedIndex.value).toBe(-1);
    expect(router.currentRoute.value.query).toStrictEqual({});

    await resetItem();

    expect(editedItem.value).toBeNull();
    expect(editedIndex.value).toBe(-1);
    expect(router.currentRoute.value.query).toStrictEqual({});
  });
});
