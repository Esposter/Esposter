import { TodoListItem } from "#shared/models/resource/todoList/TodoListItem";
import { TodoListSort } from "@/models/resource/todoList/TodoListSort";
import { sortTodoListItems } from "@/services/resource/todoList/sortTodoListItems";
import { describe, expect, test } from "vitest";

describe(sortTodoListItems, () => {
  // Listed out of every order a sort gives, and with a tie for each, so a sort that is not stable shows
  const items = [
    new TodoListItem({ createdAt: new Date(1), name: "b" }),
    new TodoListItem({ createdAt: new Date(0), dueAt: new Date(1), isImportant: true, name: "c" }),
    new TodoListItem({ createdAt: new Date(2), name: "a" }),
    new TodoListItem({ createdAt: new Date(0), dueAt: new Date(0), isImportant: true, name: "d" }),
  ];

  test.each([
    [TodoListSort.Alphabetical, ["a", "b", "c", "d"]],
    [TodoListSort.CreationDate, ["a", "b", "c", "d"]],
    [TodoListSort.DueDate, ["d", "c", "b", "a"]],
    [TodoListSort.Importance, ["c", "d", "b", "a"]],
    [TodoListSort.MyOrder, ["b", "c", "a", "d"]],
  ])("orders by %s, keeping the list's order for a tie", (sort, names) => {
    expect.hasAssertions();

    expect(sortTodoListItems(items, sort).map(({ name }) => name)).toStrictEqual(names);
  });
});
