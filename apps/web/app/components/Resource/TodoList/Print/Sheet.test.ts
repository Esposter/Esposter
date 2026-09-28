// @vitest-environment nuxt
import { TodoListItem } from "#shared/models/resource/todoList/TodoListItem";
import ResourceTodoListPrintSheet from "@/components/Resource/TodoList/Print/Sheet.vue";
import { TodoListSort } from "@/models/resource/todoList/TodoListSort";
import { useTodoListStore } from "@/store/resource/todoList";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("resourceTodoListPrintSheet", () => {
  test("prints the open todos in the viewer's sort with their steps, then the completed ones, and no notes", async () => {
    expect.hasAssertions();

    const todoListStore = useTodoListStore();
    const { items, sort } = storeToRefs(todoListStore);
    const notes = "notes";
    items.value = [
      new TodoListItem({ name: "b", notes, steps: [{ id: crypto.randomUUID(), name: "c" }] }),
      new TodoListItem({ completedAt: new Date(0), name: "d" }),
      new TodoListItem({ name: "a" }),
    ];
    sort.value = TodoListSort.Alphabetical;
    const wrapper = await mountSuspended(ResourceTodoListPrintSheet, { attachTo: document.body });
    const sheet = document.body.querySelector(".todo-list-print-sheet");

    expect(
      Array.from(sheet?.querySelectorAll(":scope > ul > li > p:first-child, li li") ?? [], ({ textContent }) =>
        textContent.trim(),
      ),
    ).toStrictEqual(["○ a", "○ b", "○ c", "● d"]);
    expect(sheet?.textContent.includes(notes)).toBe(false);

    wrapper.unmount();
  });
});
