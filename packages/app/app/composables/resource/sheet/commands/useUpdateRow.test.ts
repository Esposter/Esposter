// @vitest-environment nuxt
import { Row } from "#shared/models/resource/sheet/datasource/Row";
import { setupCommandTest } from "@/composables/resource/sheet/commands/setupCommandTest.test";
import { setupWithDataSource } from "@/composables/resource/sheet/commands/setupWithDataSource.test";
import { useSheetHistoryStore } from "@/store/resource/sheet/history";
import { takeOne, toRawDeep } from "@esposter/shared";
import { assert, describe, expect, test } from "vitest";

describe(useUpdateRow, () => {
  setupCommandTest();

  test("updates row data at given index", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const updateRow = useUpdateRow();
    const originalRow = takeOne(dataSource?.rows ?? []);
    await updateRow(new Row(Object.assign(structuredClone(toRawDeep(originalRow)), { data: { "": 10, " ": 11 } })));

    expect(takeOne(dataSource.rows).data[""]).toBe(10);
    expect(takeOne(dataSource.rows).data[" "]).toBe(11);
  });

  test("undo restores original row data", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const updateRow = useUpdateRow();
    const sheetHistoryStore = useSheetHistoryStore();
    const { undo } = sheetHistoryStore;
    const originalRow = takeOne(dataSource?.rows ?? []);
    await updateRow(new Row(Object.assign(structuredClone(toRawDeep(originalRow)), { data: { "": 10, " ": 11 } })));
    undo(dataSource);

    expect(takeOne(dataSource.rows).data[""]).toBe(0);
    expect(takeOne(dataSource.rows).data[" "]).toBe(1);
  });

  test("redo re-applies update after undo", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const updateRow = useUpdateRow();
    const sheetHistoryStore = useSheetHistoryStore();
    const { redo, undo } = sheetHistoryStore;
    const originalRow = takeOne(dataSource?.rows ?? []);
    await updateRow(new Row(Object.assign(structuredClone(toRawDeep(originalRow)), { data: { "": 10, " ": 11 } })));
    undo(dataSource);
    redo(dataSource);

    expect(takeOne(dataSource.rows).data[""]).toBe(10);
  });

  test("snapshot immutability - mutating passed object after call does not affect undo history", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const updateRow = useUpdateRow();
    const sheetHistoryStore = useSheetHistoryStore();
    const { redo, undo } = sheetHistoryStore;
    const originalRow = takeOne(dataSource?.rows ?? []);
    const updatedRow = reactive(
      new Row(Object.assign(structuredClone(toRawDeep(originalRow)), { data: { "": 10, " ": 11 } })),
    );
    await updateRow(updatedRow);
    updatedRow.data[""] = 99;
    updatedRow.data[" "] = 99;
    undo(dataSource);
    const dataSourceAfterUndo = dataSource;

    assert.exists(dataSourceAfterUndo);

    expect(takeOne(dataSourceAfterUndo.rows).data[""]).toBe(0);
    expect(takeOne(dataSourceAfterUndo.rows).data[" "]).toBe(1);

    redo(dataSource);
    const dataSourceAfterRedo = dataSource;

    assert.exists(dataSourceAfterRedo);

    expect(takeOne(dataSourceAfterRedo.rows).data[""]).toBe(10);
    expect(takeOne(dataSourceAfterRedo.rows).data[" "]).toBe(11);
  });
});
