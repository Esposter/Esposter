import { TodoListItem } from "#shared/models/tableEditor/todoList/TodoListItem";
import { createOperationData } from "@/services/shared/createOperationData";
import { beforeEach, describe, expect, test } from "vitest";

describe(createOperationData, () => {
  let operationData: ReturnType<typeof createOperationData<TodoListItem, ["id"], "Item">>;

  beforeEach(() => {
    operationData = createOperationData(ref<TodoListItem[]>([]), ["id"], "Item");
  });

  test("pushes", () => {
    expect.hasAssertions();

    const { items, pushItems } = operationData;
    const newItem = new TodoListItem();
    pushItems(newItem);

    expect(items.value).toHaveLength(1);
    expect(items.value[0]).toStrictEqual(newItem);
  });

  test("creates", () => {
    expect.hasAssertions();

    const { createItem, items } = operationData;
    const newItem = new TodoListItem();
    createItem(newItem);

    expect(items.value).toHaveLength(1);
    expect(items.value[0]).toStrictEqual(newItem);
  });

  test("updates", () => {
    expect.hasAssertions();

    const { createItem, items, updateItem } = operationData;
    const newItem = new TodoListItem();
    const updatedName = "updatedName";
    createItem(newItem);

    // eslint-disable-next-line @typescript-eslint/no-misused-spread
    const updatedItem = { ...newItem, name: updatedName };
    updateItem(updatedItem);

    expect(items.value[0]).toStrictEqual(new TodoListItem(updatedItem));
  });

  test("deletes", () => {
    expect.hasAssertions();

    const { createItem, deleteItem, items } = operationData;
    const newItem = new TodoListItem();
    createItem(newItem);
    deleteItem({ id: newItem.id });

    expect(items.value).toHaveLength(0);
  });
});
