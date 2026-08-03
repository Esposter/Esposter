import { TodoListItem } from "#shared/models/resource/todoList/TodoListItem";
import { createOperationData } from "@/services/shared/createOperationData";
import { beforeEach, describe, expect, test } from "vitest";

describe(createOperationData, () => {
  const items = ref<TodoListItem[]>([]);
  const existingItem = new TodoListItem();
  let operationData: ReturnType<typeof createOperationData<TodoListItem, ["id"], "Item">>;

  beforeEach(() => {
    items.value = [];
    operationData = createOperationData(items, ["id"], "Item");
  });

  test("pushes appends and unshifts prepends", () => {
    expect.hasAssertions();

    const { pushItems, unshiftItems } = operationData;
    const pushedItem = new TodoListItem();
    const unshiftedItem = new TodoListItem();
    items.value = [existingItem];
    pushItems(pushedItem);
    unshiftItems(unshiftedItem);

    expect(items.value).toStrictEqual([unshiftedItem, existingItem, pushedItem]);
  });

  test("creates appends and prepends when reversed", () => {
    expect.hasAssertions();

    const { createItem } = operationData;
    const createdItem = new TodoListItem();
    const reversedItem = new TodoListItem();
    items.value = [existingItem];
    createItem(createdItem);
    createItem(reversedItem, true);

    expect(items.value).toStrictEqual([reversedItem, existingItem, createdItem]);
  });

  test("creates is idempotent", () => {
    expect.hasAssertions();

    const { createItem } = operationData;
    const newItem = new TodoListItem();
    createItem(newItem);
    createItem(newItem);

    expect(items.value).toHaveLength(1);
  });

  test("updates", () => {
    expect.hasAssertions();

    const { createItem, updateItem } = operationData;
    const newItem = new TodoListItem();
    const updatedName = "updatedName";
    createItem(newItem);

    // oxlint-disable-next-line typescript/no-misused-spread
    const updatedItem = { ...newItem, name: updatedName };
    updateItem(updatedItem);

    expect(items.value[0]).toStrictEqual(new TodoListItem(updatedItem));
  });

  test("deletes", () => {
    expect.hasAssertions();

    const { createItem, deleteItem } = operationData;
    const newItem = new TodoListItem();
    createItem(newItem);
    deleteItem({ id: newItem.id });

    expect(items.value).toHaveLength(0);
  });
});
