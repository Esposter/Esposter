// @vitest-environment nuxt
import { setupCommandTest } from "@/composables/resource/file/commands/setupCommandTest.test";
import { setupWithDataSource } from "@/composables/resource/file/commands/setupWithDataSource.test";
import { useFileHistoryStore } from "@/store/resource/file/history";
import { takeOne } from "@esposter/shared";
import { assert, describe, expect, test } from "vitest";

describe(useDeleteRows, () => {
  setupCommandTest();

  test("removes all specified rows by id", () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const deleteRows = useDeleteRows();
    const rows = dataSource?.rows ?? [];
    deleteRows([takeOne(rows).id, takeOne(rows, 1).id]);

    expect(dataSource.rows).toHaveLength(0);
  });

  test("removes only the specified rows", () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const deleteRows = useDeleteRows();
    const rows = dataSource?.rows ?? [];
    deleteRows([takeOne(rows).id]);

    expect(dataSource.rows).toHaveLength(1);
    expect(takeOne(dataSource.rows).data[""]).toBe(2);
  });

  test("undo restores all deleted rows at their original positions", () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const deleteRows = useDeleteRows();
    const fileHistoryStore = useFileHistoryStore();
    const { undo } = fileHistoryStore;
    const rows = dataSource?.rows ?? [];
    deleteRows([takeOne(rows).id, takeOne(rows, 1).id]);
    undo(dataSource);

    expect(dataSource.rows).toHaveLength(2);
    expect(takeOne(dataSource.rows).data[""]).toBe(0);
    expect(takeOne(dataSource.rows, 1).data[""]).toBe(2);
  });

  test("redo re-applies the bulk delete after undo", () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const deleteRows = useDeleteRows();
    const fileHistoryStore = useFileHistoryStore();
    const { redo, undo } = fileHistoryStore;
    const rows = dataSource?.rows ?? [];
    deleteRows([takeOne(rows).id, takeOne(rows, 1).id]);
    undo(dataSource);
    redo(dataSource);

    expect(dataSource.rows).toHaveLength(0);
  });
});
