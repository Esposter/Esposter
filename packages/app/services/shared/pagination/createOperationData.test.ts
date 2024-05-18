import { TodoListItem } from "@/models/tableEditor/todoList/TodoListItem";
import { createOperationData } from "@/services/shared/pagination/createOperationData";
import { beforeEach, describe, expect, test, vi } from "vitest";

describe("Create Operation Data", () => {
  let operationData: ReturnType<typeof createOperationData<TodoListItem>>;

  beforeEach(() => {
    vi.useFakeTimers();
    operationData = createOperationData(ref<TodoListItem[]>([]));
  });

  test("pushes", () => {
    const { itemList, pushItemList } = operationData;
    const newItem = new TodoListItem();

    expect(itemList.value.length).toStrictEqual(0);

    pushItemList(newItem);

    expect(itemList.value.length).toStrictEqual(1);
    expect(itemList.value[0]).toStrictEqual(newItem);
  });

  test("creates", () => {
    const { itemList, createItem } = operationData;
    const newItem = new TodoListItem();

    expect(itemList.value.length).toStrictEqual(0);

    createItem(newItem);

    expect(itemList.value.length).toStrictEqual(1);
    expect(itemList.value[0]).toStrictEqual(newItem);
  });

  test("updates", () => {
    const { itemList, createItem, updateItem } = operationData;
    const newItem = new TodoListItem();
    const updatedName = "updatedName";
    const updatedAt = newItem.updatedAt;
    const msPassed = 1;
    createItem(newItem);

    expect(itemList.value[0].name).not.toStrictEqual(updatedName);
    vi.advanceTimersByTime(msPassed);
    updateItem({ ...newItem, name: updatedName });

    expect(itemList.value[0].name).toStrictEqual(updatedName);
    expect(itemList.value[0].updatedAt.getTime()).toStrictEqual(updatedAt.getTime() + msPassed);
  });

  test("deletes", () => {
    const { itemList, createItem, deleteItem } = operationData;
    const newItem = new TodoListItem();
    createItem(newItem);

    expect(itemList.value.length).toStrictEqual(1);

    deleteItem(newItem.id);

    expect(itemList.value.length).toStrictEqual(0);
  });
});
