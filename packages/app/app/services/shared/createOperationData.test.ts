import { TodoListItem } from "#shared/models/tableEditor/todoList/TodoListItem";
import { createOperationData } from "@/services/shared/createOperationData";
import { beforeEach, describe, expect, test } from "vitest";

describe(createOperationData, () => {
  const items = ref<TodoListItem[]>([]);
  let operationData: ReturnType<typeof createOperationData<TodoListItem, ["id"], "Item">>;

  beforeEach(() => {
    items.value = [];
    operationData = createOperationData(items, ["id"], "Item");
  });

  test("pushes", () => {
    expect.hasAssertions();

    const { pushItems } = operationData;
    const newItem = new TodoListItem();
    pushItems(newItem);

    expect(items.value).toHaveLength(1);
    expect(items.value[0]).toStrictEqual(newItem);
  });

  test("unshifts", () => {
    expect.hasAssertions();

    const { unshiftItems } = operationData;
    const newItem = new TodoListItem();
    unshiftItems(newItem);

    expect(items.value).toHaveLength(1);
    expect(items.value[0]).toStrictEqual(newItem);
  });

  test("creates", () => {
    expect.hasAssertions();

    const { createItem } = operationData;
    const newItem = new TodoListItem();
    createItem(newItem);

    expect(items.value).toHaveLength(1);
    expect(items.value[0]).toStrictEqual(newItem);
  });

  test("updates", () => {
    expect.hasAssertions();

    const { createItem, updateItem } = operationData;
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

    const { createItem, deleteItem } = operationData;
    const newItem = new TodoListItem();
    createItem(newItem);
    deleteItem({ id: newItem.id });

    expect(items.value).toHaveLength(0);
  });
});
