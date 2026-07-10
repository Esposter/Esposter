// @vitest-environment nuxt
import { StringColumn } from "#shared/models/resource/file/column/StringColumn";
import { createDataSource } from "@/composables/resource/file/commands/createDataSource.test";
import { createRow } from "@/composables/resource/file/commands/createRow.test";
import { setupCommandTest } from "@/composables/resource/file/commands/setupCommandTest.test";
import { setupWithDataSource } from "@/composables/resource/file/commands/setupWithDataSource.test";
import { useFileHistoryStore } from "@/store/resource/file/history";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(useToggleColumnVisibility, () => {
  setupCommandTest();

  test("hides a visible column", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const toggleColumnVisibility = useToggleColumnVisibility();
    const column = takeOne(dataSource?.columns ?? []);
    await toggleColumnVisibility(column.id);

    expect(takeOne(dataSource.columns).hidden).toBe(true);
  });

  test("shows a hidden column", async () => {
    expect.hasAssertions();

    const hiddenColumn = new StringColumn({ hidden: true, name: "" });
    const { dataSource } = setupWithDataSource(createDataSource([hiddenColumn], [createRow({ "": 0 })]));
    const toggleColumnVisibility = useToggleColumnVisibility();
    await toggleColumnVisibility(hiddenColumn.id);

    expect(takeOne(dataSource.columns).hidden).toBe(false);
  });

  test("undo restores original visibility", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const toggleColumnVisibility = useToggleColumnVisibility();
    const fileHistoryStore = useFileHistoryStore();
    const { undo } = fileHistoryStore;
    const column = takeOne(dataSource?.columns ?? []);
    await toggleColumnVisibility(column.id);
    undo(dataSource);

    expect(takeOne(dataSource.columns).hidden).toBe(false);
  });

  test("redo re-applies toggle after undo", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const toggleColumnVisibility = useToggleColumnVisibility();
    const fileHistoryStore = useFileHistoryStore();
    const { redo, undo } = fileHistoryStore;
    const column = takeOne(dataSource?.columns ?? []);
    await toggleColumnVisibility(column.id);
    undo(dataSource);
    redo(dataSource);

    expect(takeOne(dataSource.columns).hidden).toBe(true);
  });
});
