import { Row } from "#shared/models/tableEditor/file/Row";
import { expectToBeDefined, takeOne, toRawDeep } from "@esposter/shared";
import { setupEditedItem, setupWithDataSource } from "@/composables/tableEditor/file/commands/testUtils.test";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useUpdateRow, () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const { clear } = useDataSourceHistory();
    clear();
  });

  test("updates row data at given index", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const updateRow = useUpdateRow();
    const originalRow = takeOne(editedItem.value?.dataSource?.rows ?? [], 0);
    updateRow(new Row(Object.assign(structuredClone(toRawDeep(originalRow)), { data: { "": 10, " ": 11 } })));
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(takeOne(dataSource.rows, 0).data[""]).toBe(10);
    expect(takeOne(dataSource.rows, 0).data[" "]).toBe(11);
  });

  test("undo restores original row data", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const updateRow = useUpdateRow();
    const { undo } = useDataSourceHistory();
    const originalRow = takeOne(editedItem.value?.dataSource?.rows ?? [], 0);
    updateRow(new Row(Object.assign(structuredClone(toRawDeep(originalRow)), { data: { "": 10, " ": 11 } })));
    undo(editedItem.value);
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(takeOne(dataSource.rows, 0).data[""]).toBe(0);
    expect(takeOne(dataSource.rows, 0).data[" "]).toBe(1);
  });

  test("redo re-applies update after undo", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const updateRow = useUpdateRow();
    const { redo, undo } = useDataSourceHistory();
    const originalRow = takeOne(editedItem.value?.dataSource?.rows ?? [], 0);
    updateRow(new Row(Object.assign(structuredClone(toRawDeep(originalRow)), { data: { "": 10, " ": 11 } })));
    undo(editedItem.value);
    redo(editedItem.value);
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(takeOne(dataSource.rows, 0).data[""]).toBe(10);
  });

  test("no-op when row id not found", () => {
    expect.hasAssertions();

    setupWithDataSource();
    const updateRow = useUpdateRow();
    const { isUndoable } = useDataSourceHistory();
    updateRow(new Row({ data: { "": 10 } }));

    expect(isUndoable.value).toBe(false);
  });

  test("no-op when editedItem is undefined", () => {
    expect.hasAssertions();

    const updateRow = useUpdateRow();
    const { isUndoable } = useDataSourceHistory();
    updateRow(new Row({ data: { "": 10 } }));

    expect(isUndoable.value).toBe(false);
  });

  test("no-op when dataSource is null", () => {
    expect.hasAssertions();

    setupEditedItem();
    const updateRow = useUpdateRow();
    const { isUndoable } = useDataSourceHistory();
    updateRow(new Row({ data: { "": 10 } }));

    expect(isUndoable.value).toBe(false);
  });

  test("snapshot immutability - mutating passed object after call does not affect undo history", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const updateRow = useUpdateRow();
    const { redo, undo } = useDataSourceHistory();
    const originalRow = takeOne(editedItem.value?.dataSource?.rows ?? [], 0);
    const updatedRow = reactive(
      new Row(Object.assign(structuredClone(toRawDeep(originalRow)), { data: { "": 10, " ": 11 } })),
    );
    updateRow(updatedRow);
    updatedRow.data[""] = 99;
    updatedRow.data[" "] = 99;
    undo(editedItem.value);
    const dataSourceAfterUndo = editedItem.value?.dataSource;

    expectToBeDefined(dataSourceAfterUndo);

    expect(takeOne(dataSourceAfterUndo.rows, 0).data[""]).toBe(0);
    expect(takeOne(dataSourceAfterUndo.rows, 0).data[" "]).toBe(1);

    redo(editedItem.value);
    const dataSourceAfterRedo = editedItem.value?.dataSource;

    expectToBeDefined(dataSourceAfterRedo);

    expect(takeOne(dataSourceAfterRedo.rows, 0).data[""]).toBe(10);
    expect(takeOne(dataSourceAfterRedo.rows, 0).data[" "]).toBe(11);
  });
});
