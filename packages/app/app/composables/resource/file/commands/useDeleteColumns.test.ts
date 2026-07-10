// @vitest-environment nuxt
import { createColumn } from "@/composables/resource/file/commands/createColumn.test";
import { createDataSource } from "@/composables/resource/file/commands/createDataSource.test";
import { createRow } from "@/composables/resource/file/commands/createRow.test";
import { setupCommandTest } from "@/composables/resource/file/commands/setupCommandTest.test";
import { setupWithDataSource } from "@/composables/resource/file/commands/setupWithDataSource.test";
import { useFileHistoryStore } from "@/store/resource/file/history";
import { takeOne } from "@esposter/shared";
import { assert, describe, expect, test } from "vitest";

describe(useDeleteColumns, () => {
  setupCommandTest();

  test("removes all specified columns by id", () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const deleteColumns = useDeleteColumns();
    const columns = dataSource?.columns ?? [];
    deleteColumns([takeOne(columns).id, takeOne(columns, 1).id]);

    expect(dataSource.columns).toHaveLength(0);
  });

  test("removes only the specified column", () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const deleteColumns = useDeleteColumns();
    const columns = dataSource?.columns ?? [];
    deleteColumns([takeOne(columns).id]);

    expect(dataSource.columns).toHaveLength(1);
    expect(takeOne(dataSource.columns).name).toBe(" ");
  });

  test("also removes the column data from all rows", () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const deleteColumns = useDeleteColumns();
    const columns = dataSource?.columns ?? [];
    deleteColumns([takeOne(columns).id]);

    expect(takeOne(dataSource.rows).data[""]).toBeUndefined();
    expect(takeOne(dataSource.rows, 1).data[""]).toBeUndefined();
  });

  test("undo restores all deleted columns at their original positions", () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const deleteColumns = useDeleteColumns();
    const fileHistoryStore = useFileHistoryStore();
    const { undo } = fileHistoryStore;
    const columns = dataSource?.columns ?? [];
    deleteColumns([takeOne(columns).id, takeOne(columns, 1).id]);
    undo(dataSource);

    expect(dataSource.columns).toHaveLength(2);
    expect(takeOne(dataSource.columns).name).toBe("");
    expect(takeOne(dataSource.columns, 1).name).toBe(" ");
  });

  test("undo restores row data for deleted columns", () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const deleteColumns = useDeleteColumns();
    const fileHistoryStore = useFileHistoryStore();
    const { undo } = fileHistoryStore;
    const columns = dataSource?.columns ?? [];
    deleteColumns([takeOne(columns).id]);
    undo(dataSource);

    expect(takeOne(dataSource.rows).data[""]).toBe(0);
    expect(takeOne(dataSource.rows, 1).data[""]).toBe(2);
  });

  test("redo re-applies the bulk delete after undo", () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const deleteColumns = useDeleteColumns();
    const fileHistoryStore = useFileHistoryStore();
    const { redo, undo } = fileHistoryStore;
    const columns = dataSource?.columns ?? [];
    deleteColumns([takeOne(columns).id, takeOne(columns, 1).id]);
    undo(dataSource);
    redo(dataSource);

    expect(dataSource.columns).toHaveLength(0);
  });

  test("undo preserves row.data key order matching restored column order", () => {
    expect.hasAssertions();

    const ds = createDataSource(
      [createColumn("a"), createColumn("b"), createColumn("c")],
      [createRow({ a: 1, b: 2, c: 3 })],
    );
    const { dataSource } = setupWithDataSource(ds);
    const deleteColumns = useDeleteColumns();
    const fileHistoryStore = useFileHistoryStore();
    const { undo } = fileHistoryStore;
    const columns = dataSource?.columns ?? [];
    deleteColumns([takeOne(columns, 1).id]);
    undo(dataSource);

    expect(Object.keys(takeOne(dataSource.rows).data)).toStrictEqual(["a", "b", "c"]);
  });

  test("undo preserves row.data key order when restoring multiple deleted columns", () => {
    expect.hasAssertions();

    const ds = createDataSource(
      [createColumn("a"), createColumn("b"), createColumn("c"), createColumn("d")],
      [createRow({ a: 1, b: 2, c: 3, d: 4 })],
    );
    const { dataSource } = setupWithDataSource(ds);
    const deleteColumns = useDeleteColumns();
    const fileHistoryStore = useFileHistoryStore();
    const { undo } = fileHistoryStore;
    const columns = dataSource?.columns ?? [];
    deleteColumns([takeOne(columns, 1).id, takeOne(columns, 3).id]);
    undo(dataSource);

    expect(Object.keys(takeOne(dataSource.rows).data)).toStrictEqual(["a", "b", "c", "d"]);
  });
});
