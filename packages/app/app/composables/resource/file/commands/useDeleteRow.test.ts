// @vitest-environment nuxt
import { setupCommandTest } from "@/composables/resource/file/commands/setupCommandTest.test";
import { setupWithDataSource } from "@/composables/resource/file/commands/setupWithDataSource.test";
import { useFileHistoryStore } from "@/store/resource/file/history";
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
    const fileHistoryStore = useFileHistoryStore();
    const { undo } = fileHistoryStore;
    await deleteRow(takeOne(dataSource?.rows ?? []).id);
    undo(dataSource);

    expect(dataSource.rows).toHaveLength(2);
    expect(takeOne(dataSource.rows).data[""]).toBe(0);
  });

  test("redo re-applies delete after undo", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const deleteRow = useDeleteRow();
    const fileHistoryStore = useFileHistoryStore();
    const { redo, undo } = fileHistoryStore;
    await deleteRow(takeOne(dataSource?.rows ?? []).id);
    undo(dataSource);
    redo(dataSource);

    expect(dataSource.rows).toHaveLength(1);
    expect(takeOne(dataSource.rows).data[""]).toBe(2);
  });
});
