import { TodoListItem } from "#shared/models/tableEditor/todoList/TodoListItem";
import { createOperationData } from "@/services/shared/pagination/createOperationData";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe("createOperationData", () => {
  let operationData: ReturnType<typeof createOperationData<TodoListItem>>;

  beforeEach(() => {
    vi.useFakeTimers();
    operationData = createOperationData(ref<TodoListItem[]>([]));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("pushes", () => {
    expect.hasAssertions();

    const { itemList, pushItemList } = operationData;
    const newItem = new TodoListItem();

    expect(itemList.value).toHaveLength(0);

    pushItemList(newItem);

    expect(itemList.value).toHaveLength(1);
    expect(itemList.value[0]).toStrictEqual(newItem);
  });

  test("creates", () => {
    expect.hasAssertions();

    const { createItem, itemList } = operationData;
    const newItem = new TodoListItem();

    expect(itemList.value).toHaveLength(0);

    createItem(newItem);

    expect(itemList.value).toHaveLength(1);
    expect(itemList.value[0]).toStrictEqual(newItem);
  });

  test("updates", () => {
    expect.hasAssertions();

    const { createItem, itemList, updateItem } = operationData;
    const newItem = new TodoListItem();
    const updatedName = "updatedName";
    createItem(newItem);

    expect(itemList.value[0].name).not.toStrictEqual(updatedName);

    updateItem({ name: updatedName });

    expect(itemList.value[0].name).toStrictEqual(updatedName);
  });

  test("deletes", () => {
    expect.hasAssertions();

    const { createItem, deleteItem, itemList } = operationData;
    const newItem = new TodoListItem();
    createItem(newItem);

    expect(itemList.value).toHaveLength(1);

    deleteItem(newItem.id);

    expect(itemList.value).toHaveLength(0);
  });
});
