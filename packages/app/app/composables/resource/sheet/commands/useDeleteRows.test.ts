// @vitest-environment nuxt
import { setupCommandTest } from "@/composables/resource/sheet/commands/setupCommandTest.test";
import { setupWithDataSource } from "@/composables/resource/sheet/commands/setupWithDataSource.test";
import { useSheetHistoryStore } from "@/store/resource/sheet/history";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(useDeleteRows, () => {
  setupCommandTest();

  test("removes all specified rows by id", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const deleteRows = useDeleteRows();
    const rows = dataSource?.rows ?? [];
    await deleteRows([takeOne(rows).id, takeOne(rows, 1).id]);

    expect(dataSource.rows).toHaveLength(0);
  });

  test("removes only the specified rows", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const deleteRows = useDeleteRows();
    const rows = dataSource?.rows ?? [];
    await deleteRows([takeOne(rows).id]);

    expect(dataSource.rows).toHaveLength(1);
    expect(takeOne(dataSource.rows).data[""]).toBe(2);
  });

  test("undo restores all deleted rows at their original positions", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const deleteRows = useDeleteRows();
    const sheetHistoryStore = useSheetHistoryStore();
    const { undo } = sheetHistoryStore;
    const rows = dataSource?.rows ?? [];
    await deleteRows([takeOne(rows).id, takeOne(rows, 1).id]);
    undo(dataSource);

    expect(dataSource.rows).toHaveLength(2);
    expect(takeOne(dataSource.rows).data[""]).toBe(0);
    expect(takeOne(dataSource.rows, 1).data[""]).toBe(2);
  });

  test("redo re-applies the bulk delete after undo", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const deleteRows = useDeleteRows();
    const sheetHistoryStore = useSheetHistoryStore();
    const { redo, undo } = sheetHistoryStore;
    const rows = dataSource?.rows ?? [];
    await deleteRows([takeOne(rows).id, takeOne(rows, 1).id]);
    undo(dataSource);
    redo(dataSource);

    expect(dataSource.rows).toHaveLength(0);
  });
});
