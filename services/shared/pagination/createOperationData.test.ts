import { TodoListItem } from "@/models/tableEditor/todoList/TodoListItem";
import { createOperationData } from "@/services/shared/pagination/createOperationData";
import { beforeEach, describe, expect, test } from "vitest";

describe("Create Operation Data", () => {
  let operationData: ReturnType<typeof createOperationData<TodoListItem>>;

  beforeEach(() => {
    operationData = createOperationData(ref<TodoListItem[]>([]));
  });

  test("pushes", () => {
    const { pushItemList } = operationData;
    const newItem = new TodoListItem();

    expect(operationData.itemList.value.length).toStrictEqual(0);

    pushItemList(newItem);

    expect(operationData.itemList.value.length).toStrictEqual(1);
    expect(operationData.itemList.value[0]).toStrictEqual(newItem);
  });

  test("creates", () => {
    const { createItem } = operationData;
    const newItem = new TodoListItem();

    expect(operationData.itemList.value.length).toStrictEqual(0);

    createItem(newItem);

    expect(operationData.itemList.value.length).toStrictEqual(1);
    expect(operationData.itemList.value[0]).toStrictEqual(newItem);
  });

  test("updates", () => {
    const { createItem, updateItem } = operationData;
    const newItem = new TodoListItem();
    const updatedName = "updatedName";
    const updatedAt = newItem.updatedAt;
    createItem(newItem);

    expect(operationData.itemList.value[0].name).not.toStrictEqual(updatedName);

    updateItem({ ...newItem, name: updatedName });

    expect(operationData.itemList.value[0].name).toStrictEqual(updatedName);
    expect(operationData.itemList.value[0].updatedAt.getMilliseconds()).toBeGreaterThan(updatedAt.getMilliseconds());
  });

  test("deletes", () => {
    const { createItem, deleteItem } = operationData;
    const newItem = new TodoListItem();
    createItem(newItem);

    expect(operationData.itemList.value.length).toStrictEqual(1);

    deleteItem(newItem.id);

    expect(operationData.itemList.value.length).toStrictEqual(0);
  });
});
