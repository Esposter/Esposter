import { Row } from "#shared/models/tableEditor/file/Row";
import { expectToBeDefined } from "#shared/test/expectToBeDefined";
import { useEditedItemDataSourceOperations } from "@/composables/tableEditor/file/useEditedItemDataSourceOperations";
import {
  setupEditedItem,
  setupWithDataSource,
} from "@/composables/tableEditor/file/useEditedItemDataSourceOperations/testUtils.test";
import { takeOne, toRawDeep } from "@esposter/shared";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe("updateRow", () => {
  beforeEach(() => {
    const { clear } = useDataSourceHistory();
    setActivePinia(createPinia());
    clear();
  });

  test("updates row data at given index", () => {
    expect.hasAssertions();

    const { editedItem, operations } = setupWithDataSource();
    const { updateRow } = operations;
    const originalRow = takeOne(editedItem.value?.dataSource?.rows ?? [], 0);
    updateRow(new Row(Object.assign(structuredClone(toRawDeep(originalRow)), { data: { "": 10, " ": 11 } })));
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(takeOne(dataSource.rows, 0).data[""]).toBe(10);
    expect(takeOne(dataSource.rows, 0).data[" "]).toBe(11);
  });

  test("undo restores original row data", () => {
    expect.hasAssertions();

    const { editedItem, operations } = setupWithDataSource();
    const { undo, updateRow } = operations;
    const originalRow = takeOne(editedItem.value?.dataSource?.rows ?? [], 0);
    updateRow(new Row(Object.assign(structuredClone(toRawDeep(originalRow)), { data: { "": 10, " ": 11 } })));
    undo();
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(takeOne(dataSource.rows, 0).data[""]).toBe(0);
    expect(takeOne(dataSource.rows, 0).data[" "]).toBe(1);
  });

  test("redo re-applies update after undo", () => {
    expect.hasAssertions();

    const { editedItem, operations } = setupWithDataSource();
    const { redo, undo, updateRow } = operations;
    const originalRow = takeOne(editedItem.value?.dataSource?.rows ?? [], 0);
    updateRow(new Row(Object.assign(structuredClone(toRawDeep(originalRow)), { data: { "": 10, " ": 11 } })));
    undo();
    redo();
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(takeOne(dataSource.rows, 0).data[""]).toBe(10);
  });

  test("no-op when row id not found", () => {
    expect.hasAssertions();

    const { operations } = setupWithDataSource();
    const { isUndoable, updateRow } = operations;
    updateRow(new Row({ data: { "": 10 } }));

    expect(isUndoable.value).toBe(false);
  });

  test("no-op when editedItem is undefined", () => {
    expect.hasAssertions();

    const { isUndoable, updateRow } = useEditedItemDataSourceOperations();
    updateRow(new Row({ data: { "": 10 } }));

    expect(isUndoable.value).toBe(false);
  });

  test("no-op when dataSource is null", () => {
    expect.hasAssertions();

    setupEditedItem();
    const { isUndoable, updateRow } = useEditedItemDataSourceOperations();
    updateRow(new Row({ data: { "": 10 } }));

    expect(isUndoable.value).toBe(false);
  });

  test("snapshot immutability - mutating passed object after call does not affect undo history", () => {
    expect.hasAssertions();

    const { editedItem, operations } = setupWithDataSource();
    const { redo, undo, updateRow } = operations;
    const originalRow = takeOne(editedItem.value?.dataSource?.rows ?? [], 0);
    const updatedRow = reactive(
      new Row(Object.assign(structuredClone(toRawDeep(originalRow)), { data: { "": 10, " ": 11 } })),
    );
    updateRow(updatedRow);
    updatedRow.data[""] = 99;
    updatedRow.data[" "] = 99;
    undo();
    const dataSourceAfterUndo = editedItem.value?.dataSource;

    expectToBeDefined(dataSourceAfterUndo);

    expect(takeOne(dataSourceAfterUndo.rows, 0).data[""]).toBe(0);
    expect(takeOne(dataSourceAfterUndo.rows, 0).data[" "]).toBe(1);

    redo();
    const dataSourceAfterRedo = editedItem.value?.dataSource;

    expectToBeDefined(dataSourceAfterRedo);

    expect(takeOne(dataSourceAfterRedo.rows, 0).data[""]).toBe(10);
    expect(takeOne(dataSourceAfterRedo.rows, 0).data[" "]).toBe(11);
  });
});
