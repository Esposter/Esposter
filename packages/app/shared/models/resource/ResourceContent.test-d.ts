import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { Row } from "#shared/models/resource/sheet/datasource/Row";
import type { TodoListItem } from "#shared/models/resource/todoList/TodoListItem";
import type { ToData } from "@esposter/shared";

import { describe, expect, expectTypeOf, test } from "vitest";

type MethodKeys<T> = { [K in keyof T]: T[K] extends (...args: never[]) => unknown ? K : never }[keyof T];

describe("resourceContent type", () => {
  // A content blob is parsed with plain JSON.parse and the type's content schema, so a store is handed the
  // Data shape and casts it back to the class its ref declares. That cast is sound only while `toJSON` is the
  // Only method these classes carry: `ToData` strips it, and `JSON.stringify` reproduces what it does anyway.
  // A second method would survive into the data shape as a property callers may reach for and the parsed
  // Object does not have — this fails on the day one is added, which is the day the casts become a lie
  test("content classes carry no method a parsed blob would be missing", () => {
    expect.hasAssertions();

    expectTypeOf<MethodKeys<ToData<Column>>>().toEqualTypeOf<never>();
    expectTypeOf<MethodKeys<ToData<Row>>>().toEqualTypeOf<never>();
    expectTypeOf<MethodKeys<ToData<TodoListItem>>>().toEqualTypeOf<never>();
  });
});
