// @vitest-environment nuxt
import type { StringColumn } from "#shared/models/resource/sheet/column/StringColumn";

import { createColumn } from "@/composables/resource/sheet/commands/createColumn.test";
import { createDataSource } from "@/composables/resource/sheet/commands/createDataSource.test";
import { createRow } from "@/composables/resource/sheet/commands/createRow.test";
import { setupCommandTest } from "@/composables/resource/sheet/commands/setupCommandTest.test";
import { setupWithDataSource } from "@/composables/resource/sheet/commands/setupWithDataSource.test";
import { useSheetHistoryStore } from "@/store/resource/sheet/history";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(useReorderColumns, () => {
  setupCommandTest();

  test("moves column forward (index 0 to 1)", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const reorderColumns = useReorderColumns();
    const columns = dataSource?.columns ?? [];
    const newColumns = [takeOne(columns, 1), takeOne(columns)] as StringColumn[];
    await reorderColumns(newColumns);

    expect(takeOne(dataSource.columns).name).toBe(" ");
    expect(takeOne(dataSource.columns, 1).name).toBe("");
  });

  test("undo restores original column order", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const reorderColumns = useReorderColumns();
    const sheetHistoryStore = useSheetHistoryStore();
    const { undo } = sheetHistoryStore;
    const columns = dataSource?.columns ?? [];
    const newColumns = [takeOne(columns, 1), takeOne(columns)] as StringColumn[];
    await reorderColumns(newColumns);
    undo(dataSource);

    expect(takeOne(dataSource.columns).name).toBe("");
    expect(takeOne(dataSource.columns, 1).name).toBe(" ");
  });

  test("moves column backward (index 1 to 0) with three columns", async () => {
    expect.hasAssertions();

    const threeColumnDataSource = createDataSource(
      [createColumn("a"), createColumn("b"), createColumn("c")],
      [createRow({ a: 0, b: 1, c: 2 })],
    );
    const { dataSource } = setupWithDataSource(threeColumnDataSource);
    const reorderColumns = useReorderColumns();
    const columns = dataSource?.columns ?? [];
    const newColumns = [takeOne(columns, 1), takeOne(columns), takeOne(columns, 2)] as StringColumn[];
    await reorderColumns(newColumns);

    expect(takeOne(dataSource.columns).name).toBe("b");
    expect(takeOne(dataSource.columns, 1).name).toBe("a");
    expect(takeOne(dataSource.columns, 2).name).toBe("c");
  });

  test("moves column forward non-adjacent (index 0 to 2) with three columns", async () => {
    expect.hasAssertions();

    const threeColumnDataSource = createDataSource(
      [createColumn("a"), createColumn("b"), createColumn("c")],
      [createRow({ a: 0, b: 1, c: 2 })],
    );
    const { dataSource } = setupWithDataSource(threeColumnDataSource);
    const reorderColumns = useReorderColumns();
    const columns = dataSource?.columns ?? [];
    const newColumns = [takeOne(columns, 1), takeOne(columns, 2), takeOne(columns)] as StringColumn[];
    await reorderColumns(newColumns);

    expect(takeOne(dataSource.columns).name).toBe("b");
    expect(takeOne(dataSource.columns, 1).name).toBe("c");
    expect(takeOne(dataSource.columns, 2).name).toBe("a");
  });
});
