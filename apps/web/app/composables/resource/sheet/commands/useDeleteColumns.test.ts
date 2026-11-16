// @vitest-environment nuxt
import { createColumn } from "#shared/models/resource/sheet/column/createColumn.test";
import { createDataSource } from "#shared/models/resource/sheet/datasource/createDataSource.test";
import { createRow } from "#shared/models/resource/sheet/datasource/createRow.test";
import { setupCommandTest } from "#src/composables/resource/sheet/commands/setupCommandTest.test";
import { setupWithDataSource } from "#src/composables/resource/sheet/commands/setupWithDataSource.test";
import { useSheetHistoryStore } from "#src/store/resource/sheet/history/index";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(useDeleteColumns, () => {
  setupCommandTest();

  test("removes all specified columns by id", () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const deleteColumns = useDeleteColumns();
    deleteColumns([takeOne(dataSource.columns).id, takeOne(dataSource.columns, 1).id]);

    expect(dataSource.columns).toStrictEqual([]);
  });

  test("removes only the specified column", () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const deleteColumns = useDeleteColumns();
    deleteColumns([takeOne(dataSource.columns).id]);

    expect(dataSource.columns.map(({ name }) => name)).toStrictEqual([" "]);
    expect(dataSource.rows.map(({ data }) => data)).toStrictEqual([{ " ": 1 }, { " ": 3 }]);
  });

  test("undo preserves row.data key order when restoring multiple deleted columns", () => {
    expect.hasAssertions();

    const initialDataSource = createDataSource(
      [createColumn("a"), createColumn("b"), createColumn("c"), createColumn("d")],
      [createRow({ a: 1, b: 2, c: 3, d: 4 })],
    );
    const { dataSource } = setupWithDataSource(initialDataSource);
    const deleteColumns = useDeleteColumns();
    const sheetHistoryStore = useSheetHistoryStore();
    const { undo } = sheetHistoryStore;
    deleteColumns([takeOne(dataSource.columns, 1).id, takeOne(dataSource.columns, 3).id]);
    undo(dataSource);

    expect(Object.keys(takeOne(dataSource.rows).data)).toStrictEqual(["a", "b", "c", "d"]);
  });
});
