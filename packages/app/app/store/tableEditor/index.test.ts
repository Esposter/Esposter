import type { Router } from "vue-router";

import { TodoListItem } from "#shared/models/tableEditor/todoList/TodoListItem";
import { expectToBeDefined } from "#shared/test/expectToBeDefined";
import { ID_QUERY_PARAMETER_KEY } from "@/services/shared/constants";
import { useTableEditorStore } from "@/store/tableEditor";
import { useItemStore } from "@/store/tableEditor/item";
import { takeOne } from "@esposter/shared";
import { createPinia, setActivePinia } from "pinia";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";

describe(useTableEditorStore, () => {
  let router: Router;

  beforeAll(() => {
    router = useRouter();
  });

  beforeEach(() => {
    setActivePinia(createPinia());
    router.currentRoute.value.query = {};
  });

  test("default values", () => {
    expect.hasAssertions();

    const router = useRouter();
    const tableEditorStore = useTableEditorStore<TodoListItem>();
    const { editedIndex, editedItem, editFormDialog, tableEditor } = storeToRefs(tableEditorStore);

    expect(router.currentRoute.value.query).toStrictEqual({});
    expect(editedIndex.value).toBe(-1);
    expect(editedItem.value).toBeUndefined();
    expect(editFormDialog.value).toBe(false);
    expect(tableEditor.value.items).toHaveLength(0);
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
    await editItem({ id: newItem.id });

    expect(router.currentRoute.value.query).toStrictEqual({ [ID_QUERY_PARAMETER_KEY]: newItem.id });
    // The edited item will be a structured clone object of the original item class
    // Object !== class (not strictly equal) so we manually convert it to the class
    expect(new TodoListItem(editedItem.value)).toStrictEqual(newItem);
    expect(editedIndex.value).toBe(0);
    expect(editFormDialog.value).toBe(true);
  });

  test("save unedited item", async () => {
    expect.hasAssertions();

    const tableEditorStore = useTableEditorStore<TodoListItem>();
    const { editFormDialog } = storeToRefs(tableEditorStore);
    const { save } = tableEditorStore;

    await save();

    expect(editFormDialog.value).toBe(false);
  });

  test("save new item", async () => {
    expect.hasAssertions();

    const tableEditorStore = useTableEditorStore<TodoListItem>();
    const { editedItem, tableEditor } = storeToRefs(tableEditorStore);
    const { save } = tableEditorStore;
    const newItem = new TodoListItem();

    editedItem.value = newItem;

    await save();

    expect(tableEditor.value.items).toHaveLength(1);
    expect(takeOne(tableEditor.value.items)).toStrictEqual(newItem);
  });

  test("save update item", async () => {
    expect.hasAssertions();

    const tableEditorStore = useTableEditorStore<TodoListItem>();
    const { editedItem, tableEditor } = storeToRefs(tableEditorStore);
    const { editItem, save } = tableEditorStore;
    const itemStore = useItemStore();
    const { createItem } = itemStore;
    const newItem = new TodoListItem();
    const updatedName = "updatedName";

    createItem(newItem);

    expect(takeOne(tableEditor.value.items).name).not.toBe(updatedName);

    await editItem({ id: newItem.id });
    expectToBeDefined(editedItem.value);
    editedItem.value.name = updatedName;
    await save();

    expect(takeOne(tableEditor.value.items).name).toBe(updatedName);
  });

  test("save delete item", async () => {
    expect.hasAssertions();

    const tableEditorStore = useTableEditorStore<TodoListItem>();
    const { tableEditor } = storeToRefs(tableEditorStore);
    const { editItem, save } = tableEditorStore;
    const itemStore = useItemStore();
    const { createItem } = itemStore;
    const newItem = new TodoListItem();

    createItem(newItem);

    await editItem({ id: newItem.id });
    await save(true);

    expect(tableEditor.value.items).toHaveLength(0);
  });

  test("reset item", async () => {
    expect.hasAssertions();

    const router = useRouter();
    const tableEditorStore = useTableEditorStore<TodoListItem>();
    const { editedIndex, editedItem, editFormDialog, tableEditor } = storeToRefs(tableEditorStore);
    const { resetItem } = tableEditorStore;

    await resetItem();

    expect(router.currentRoute.value.query).toStrictEqual({});
    expect(editedIndex.value).toBe(-1);
    expect(editedItem.value).toBeUndefined();
    expect(editFormDialog.value).toBe(false);
    expect(tableEditor.value.items).toHaveLength(0);
  });
});
