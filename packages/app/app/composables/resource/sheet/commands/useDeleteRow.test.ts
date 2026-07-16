// @vitest-environment nuxt
import { setupCommandTest } from "@/composables/resource/sheet/commands/setupCommandTest.test";
import { setupWithDataSource } from "@/composables/resource/sheet/commands/setupWithDataSource.test";
import { useSheetHistoryStore } from "@/store/resource/sheet/history";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(useDeleteRow, () => {
  setupCommandTest();

  test("removes row at given index", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const deleteRow = useDeleteRow();
    await deleteRow(takeOne(dataSource?.rows ?? []).id);

    expect(dataSource.rows).toHaveLength(1);
    expect(takeOne(dataSource.rows).data[""]).toBe(2);
  });

  test("undo restores deleted row", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const deleteRow = useDeleteRow();
    const sheetHistoryStore = useSheetHistoryStore();
    const { undo } = sheetHistoryStore;
    await deleteRow(takeOne(dataSource?.rows ?? []).id);
    undo(dataSource);

    expect(dataSource.rows).toHaveLength(2);
    expect(takeOne(dataSource.rows).data[""]).toBe(0);
  });

  test("redo re-applies delete after undo", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const deleteRow = useDeleteRow();
    const sheetHistoryStore = useSheetHistoryStore();
    const { redo, undo } = sheetHistoryStore;
    await deleteRow(takeOne(dataSource?.rows ?? []).id);
    undo(dataSource);
    redo(dataSource);

    expect(dataSource.rows).toHaveLength(1);
    expect(takeOne(dataSource.rows).data[""]).toBe(2);
  });
});
