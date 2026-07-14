// @vitest-environment nuxt
import { StringColumn } from "#shared/models/resource/sheet/column/StringColumn";
import { createDataSource } from "@/composables/resource/sheet/commands/createDataSource.test";
import { createRow } from "@/composables/resource/sheet/commands/createRow.test";
import { setupCommandTest } from "@/composables/resource/sheet/commands/setupCommandTest.test";
import { setupWithDataSource } from "@/composables/resource/sheet/commands/setupWithDataSource.test";
import { useSheetHistoryStore } from "@/store/resource/sheet/history";
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
    const sheetHistoryStore = useSheetHistoryStore();
    const { undo } = sheetHistoryStore;
    const column = takeOne(dataSource?.columns ?? []);
    await toggleColumnVisibility(column.id);
    undo(dataSource);

    expect(takeOne(dataSource.columns).hidden).toBe(false);
  });

  test("redo re-applies toggle after undo", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const toggleColumnVisibility = useToggleColumnVisibility();
    const sheetHistoryStore = useSheetHistoryStore();
    const { redo, undo } = sheetHistoryStore;
    const column = takeOne(dataSource?.columns ?? []);
    await toggleColumnVisibility(column.id);
    undo(dataSource);
    redo(dataSource);

    expect(takeOne(dataSource.columns).hidden).toBe(true);
  });
});
