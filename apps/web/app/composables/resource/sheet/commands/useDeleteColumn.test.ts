// @vitest-environment nuxt
import { createColumn } from "#shared/models/resource/sheet/column/createColumn.test";
import { createDataSource } from "#shared/models/resource/sheet/datasource/createDataSource.test";
import { createRow } from "#shared/models/resource/sheet/datasource/createRow.test";
import { setupCommandTest } from "#src/composables/resource/sheet/commands/setupCommandTest.test";
import { setupWithDataSource } from "#src/composables/resource/sheet/commands/setupWithDataSource.test";
import { useSheetHistoryStore } from "#src/store/resource/sheet/history/index";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(useDeleteColumn, () => {
  setupCommandTest();

  test("removes column by name", () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const deleteColumn = useDeleteColumn();
    deleteColumn("");

    expect(dataSource.columns.map(({ name }) => name)).toStrictEqual([" "]);
    expect(dataSource.rows.map(({ data }) => data)).toStrictEqual([{ " ": 1 }, { " ": 3 }]);
  });

  test("undo preserves row.data key order after restore", () => {
    expect.hasAssertions();

    const initialDataSource = createDataSource(
      [createColumn("a"), createColumn("b"), createColumn("c")],
      [createRow({ a: 1, b: 2, c: 3 })],
    );
    const { dataSource } = setupWithDataSource(initialDataSource);
    const deleteColumn = useDeleteColumn();
    const sheetHistoryStore = useSheetHistoryStore();
    const { undo } = sheetHistoryStore;
    deleteColumn("b");
    undo(dataSource);

    expect(Object.keys(takeOne(dataSource.rows).data)).toStrictEqual(["a", "b", "c"]);
  });
});
