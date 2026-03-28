import type { TodoListItem } from "#shared/models/tableEditor/todoList/TodoListItem";
import type { TodoListItemType } from "#shared/models/tableEditor/todoList/TodoListItemType";
import type { RecursiveDeepOmitItemEntity } from "#shared/util/types/RecursiveDeepOmitItemEntity";

import { describe, expect, expectTypeOf, test } from "vitest";

describe("recursiveDeepOmitItemEntity type", () => {
  test("omits updatedAt and toJSON from TodoListItem", () => {
    expect.hasAssertions();

    expectTypeOf<RecursiveDeepOmitItemEntity<TodoListItem>>().toEqualTypeOf<{
      createdAt: Date;
      deletedAt: Date | null;
      dueAt: Date | null;
      id: string;
      name: string;
      notes: string;
      type: TodoListItemType;
    }>();
  });

  test("omits default keys plus additional top-level key", () => {
    expect.hasAssertions();

    expectTypeOf<RecursiveDeepOmitItemEntity<TodoListItem, ["notes"]>>().toEqualTypeOf<{
      createdAt: Date;
      deletedAt: Date | null;
      dueAt: Date | null;
      id: string;
      name: string;
      type: TodoListItemType;
    }>();
  });

  test("omits default keys plus nested key", () => {
    expect.hasAssertions();

    expectTypeOf<RecursiveDeepOmitItemEntity<TodoListItem, ["type"]>>().toEqualTypeOf<{
      createdAt: Date;
      deletedAt: Date | null;
      dueAt: Date | null;
      id: string;
      name: string;
      notes: string;
    }>();
  });

  test("omits default keys plus multiple keys", () => {
    expect.hasAssertions();

    expectTypeOf<RecursiveDeepOmitItemEntity<TodoListItem, ["notes", "dueAt"]>>().toEqualTypeOf<{
      createdAt: Date;
      deletedAt: Date | null;
      id: string;
      name: string;
      type: TodoListItemType;
    }>();
  });

  test("preserves Date and other excluded types", () => {
    expect.hasAssertions();

    expectTypeOf<RecursiveDeepOmitItemEntity<TodoListItem, ["dueAt"]>>().toEqualTypeOf<{
      createdAt: Date;
      deletedAt: Date | null;
      id: string;
      name: string;
      notes: string;
      type: TodoListItemType;
    }>();
  });
});
