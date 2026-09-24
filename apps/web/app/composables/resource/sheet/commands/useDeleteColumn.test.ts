// @vitest-environment nuxt
import { createColumn } from "@/composables/resource/sheet/commands/createColumn.test";
import { createDataSource } from "@/composables/resource/sheet/commands/createDataSource.test";
import { createRow } from "@/composables/resource/sheet/commands/createRow.test";
import { setupCommandTest } from "@/composables/resource/sheet/commands/setupCommandTest.test";
import { setupWithDataSource } from "@/composables/resource/sheet/commands/setupWithDataSource.test";
import { useSheetHistoryStore } from "@/store/resource/sheet/history";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(useDeleteColumn, () => {
  setupCommandTest();

  test("removes column by name", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const deleteColumn = useDeleteColumn();
    await deleteColumn("");

    expect(dataSource.columns.map(({ name }) => name)).toStrictEqual([" "]);
    expect(dataSource.rows.map(({ data }) => data)).toStrictEqual([{ " ": 1 }, { " ": 3 }]);
  });

  test("undo preserves row.data key order after restore", async () => {
    expect.hasAssertions();

    const initialDataSource = createDataSource(
      [createColumn("a"), createColumn("b"), createColumn("c")],
      [createRow({ a: 1, b: 2, c: 3 })],
    );
    const { dataSource } = setupWithDataSource(initialDataSource);
    const deleteColumn = useDeleteColumn();
    const sheetHistoryStore = useSheetHistoryStore();
    const { undo } = sheetHistoryStore;
    await deleteColumn("b");
    undo(dataSource);

    expect(Object.keys(takeOne(dataSource.rows).data)).toStrictEqual(["a", "b", "c"]);
  });
});
