// @vitest-environment nuxt
import { createColumn } from "@/composables/resource/sheet/commands/createColumn.test";
import { createDataSource } from "@/composables/resource/sheet/commands/createDataSource.test";
import { createRow } from "@/composables/resource/sheet/commands/createRow.test";
import { setupCommandTest } from "@/composables/resource/sheet/commands/setupCommandTest.test";
import { setupWithDataSource } from "@/composables/resource/sheet/commands/setupWithDataSource.test";
import { useSheetHistoryStore } from "@/store/resource/sheet/history";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(useDeleteColumns, () => {
  setupCommandTest();

  test("removes all specified columns by id", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const deleteColumns = useDeleteColumns();
    const columns = dataSource?.columns ?? [];
    await deleteColumns([takeOne(columns).id, takeOne(columns, 1).id]);

    expect(dataSource.columns).toHaveLength(0);
  });

  test("removes only the specified column", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const deleteColumns = useDeleteColumns();
    const columns = dataSource?.columns ?? [];
    await deleteColumns([takeOne(columns).id]);

    expect(dataSource.columns).toHaveLength(1);
    expect(takeOne(dataSource.columns).name).toBe(" ");
    expect(takeOne(dataSource.rows).data[""]).toBeUndefined();
    expect(takeOne(dataSource.rows, 1).data[""]).toBeUndefined();
  });

  test("undo restores all deleted columns at their original positions", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const deleteColumns = useDeleteColumns();
    const sheetHistoryStore = useSheetHistoryStore();
    const { undo } = sheetHistoryStore;
    const columns = dataSource?.columns ?? [];
    await deleteColumns([takeOne(columns).id, takeOne(columns, 1).id]);
    undo(dataSource);

    expect(dataSource.columns).toHaveLength(2);
    expect(takeOne(dataSource.columns).name).toBe("");
    expect(takeOne(dataSource.columns, 1).name).toBe(" ");
  });

  test("undo restores row data for deleted columns", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const deleteColumns = useDeleteColumns();
    const sheetHistoryStore = useSheetHistoryStore();
    const { undo } = sheetHistoryStore;
    const columns = dataSource?.columns ?? [];
    await deleteColumns([takeOne(columns).id]);
    undo(dataSource);

    expect(takeOne(dataSource.rows).data[""]).toBe(0);
    expect(takeOne(dataSource.rows, 1).data[""]).toBe(2);
  });

  test("redo re-applies the bulk delete after undo", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const deleteColumns = useDeleteColumns();
    const sheetHistoryStore = useSheetHistoryStore();
    const { redo, undo } = sheetHistoryStore;
    const columns = dataSource?.columns ?? [];
    await deleteColumns([takeOne(columns).id, takeOne(columns, 1).id]);
    undo(dataSource);
    redo(dataSource);

    expect(dataSource.columns).toHaveLength(0);
  });

  test("undo preserves row.data key order matching restored column order", async () => {
    expect.hasAssertions();

    const initialDataSource = createDataSource(
      [createColumn("a"), createColumn("b"), createColumn("c")],
      [createRow({ a: 1, b: 2, c: 3 })],
    );
    const { dataSource } = setupWithDataSource(initialDataSource);
    const deleteColumns = useDeleteColumns();
    const sheetHistoryStore = useSheetHistoryStore();
    const { undo } = sheetHistoryStore;
    const columns = dataSource?.columns ?? [];
    await deleteColumns([takeOne(columns, 1).id]);
    undo(dataSource);

    expect(Object.keys(takeOne(dataSource.rows).data)).toStrictEqual(["a", "b", "c"]);
  });

  test("undo preserves row.data key order when restoring multiple deleted columns", async () => {
    expect.hasAssertions();

    const initialDataSource = createDataSource(
      [createColumn("a"), createColumn("b"), createColumn("c"), createColumn("d")],
      [createRow({ a: 1, b: 2, c: 3, d: 4 })],
    );
    const { dataSource } = setupWithDataSource(initialDataSource);
    const deleteColumns = useDeleteColumns();
    const sheetHistoryStore = useSheetHistoryStore();
    const { undo } = sheetHistoryStore;
    const columns = dataSource?.columns ?? [];
    await deleteColumns([takeOne(columns, 1).id, takeOne(columns, 3).id]);
    undo(dataSource);

    expect(Object.keys(takeOne(dataSource.rows).data)).toStrictEqual(["a", "b", "c", "d"]);
  });
});
