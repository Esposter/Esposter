import { Column } from "#shared/models/tableEditor/file/Column";
import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import {
  makeColumn,
  makeDataSource,
  makeRow,
  setupEditedItem,
  setupWithDataSource,
} from "@/composables/tableEditor/file/commands/testUtils.test";
import { NormalizeStringMode } from "@/models/tableEditor/file/commands/NormalizeStringMode";
import { takeOne } from "@esposter/shared";
import { createPinia, setActivePinia } from "pinia";
import { assert, beforeEach, describe, expect, test } from "vitest";

describe(useNormalizeStrings, () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const { clear } = useDataSourceHistory();
    clear();
  });

  test(`${NormalizeStringMode.Trim} strips whitespace from all string cells`, () => {
    expect.hasAssertions();

    const ds = makeDataSource(
      [makeColumn(""), makeColumn(" ")],
      [makeRow({ "": " ", " ": " " }), makeRow({ "": " ", " ": " " })],
    );
    const { editedItem } = setupWithDataSource(ds);
    const normalizeStrings = useNormalizeStrings();
    normalizeStrings(NormalizeStringMode.Trim);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(takeOne(dataSource.rows, 0).data[""]).toBe("");
    expect(takeOne(dataSource.rows, 0).data[" "]).toBe("");
    expect(takeOne(dataSource.rows, 1).data[""]).toBe("");
    expect(takeOne(dataSource.rows, 1).data[" "]).toBe("");
  });

  test(`${NormalizeStringMode.Lowercase} lowercases all string cells`, () => {
    expect.hasAssertions();

    const ds = makeDataSource([makeColumn("")], [makeRow({ "": "A" })]);
    const { editedItem } = setupWithDataSource(ds);
    const normalizeStrings = useNormalizeStrings();
    normalizeStrings(NormalizeStringMode.Lowercase);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(takeOne(dataSource.rows, 0).data[""]).toBe("a");
  });

  test(`${NormalizeStringMode.Uppercase} uppercases all string cells`, () => {
    expect.hasAssertions();

    const ds = makeDataSource([makeColumn("")], [makeRow({ "": "a" })]);
    const { editedItem } = setupWithDataSource(ds);
    const normalizeStrings = useNormalizeStrings();
    normalizeStrings(NormalizeStringMode.Uppercase);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(takeOne(dataSource.rows, 0).data[""]).toBe("A");
  });

  test("skips non-string columns", () => {
    expect.hasAssertions();

    const numberColumn = new Column({
      name: "",
      size: 0,
      sourceName: "",
      type: ColumnType.Number,
    }) as unknown as Column;
    const ds = makeDataSource([numberColumn], [makeRow({ "": 0 })]);
    const { editedItem } = setupWithDataSource(ds);
    const normalizeStrings = useNormalizeStrings();
    const { isUndoable } = useDataSourceHistory();
    normalizeStrings(NormalizeStringMode.Trim);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(takeOne(dataSource.rows, 0).data[""]).toBe(0);
    expect(isUndoable.value).toBe(false);
  });

  test("skips hidden columns", () => {
    expect.hasAssertions();

    const hiddenColumn = new Column({ hidden: true, name: "", size: 0, sourceName: "" });
    const ds = makeDataSource([hiddenColumn], [makeRow({ "": " " })]);
    const { editedItem } = setupWithDataSource(ds);
    const normalizeStrings = useNormalizeStrings();
    const { isUndoable } = useDataSourceHistory();
    normalizeStrings(NormalizeStringMode.Trim);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(takeOne(dataSource.rows, 0).data[""]).toBe(" ");
    expect(isUndoable.value).toBe(false);
  });

  test("undo restores all original values", () => {
    expect.hasAssertions();

    const ds = makeDataSource([makeColumn("")], [makeRow({ "": " " }), makeRow({ "": " " })]);
    const { editedItem } = setupWithDataSource(ds);
    const normalizeStrings = useNormalizeStrings();
    const { undo } = useDataSourceHistory();
    const editedItemValue = editedItem.value;

    assert.exists(editedItemValue);

    normalizeStrings(NormalizeStringMode.Trim);
    undo(editedItemValue);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(takeOne(dataSource.rows, 0).data[""]).toBe(" ");
    expect(takeOne(dataSource.rows, 1).data[""]).toBe(" ");
  });

  test("redo re-applies after undo", () => {
    expect.hasAssertions();

    const ds = makeDataSource([makeColumn("")], [makeRow({ "": " " })]);
    const { editedItem } = setupWithDataSource(ds);
    const normalizeStrings = useNormalizeStrings();
    const { redo, undo } = useDataSourceHistory();
    const editedItemValue = editedItem.value;

    assert.exists(editedItemValue);

    normalizeStrings(NormalizeStringMode.Trim);
    undo(editedItemValue);
    redo(editedItemValue);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(takeOne(dataSource.rows, 0).data[""]).toBe("");
  });

  test("no-op when editedItem is undefined", () => {
    expect.hasAssertions();

    const { isUndoable } = useDataSourceHistory();
    const normalizeStrings = useNormalizeStrings();
    normalizeStrings(NormalizeStringMode.Trim);

    expect(isUndoable.value).toBe(false);
  });

  test("no-op when dataSource is null", () => {
    expect.hasAssertions();

    setupEditedItem();
    const { isUndoable } = useDataSourceHistory();
    const normalizeStrings = useNormalizeStrings();
    normalizeStrings(NormalizeStringMode.Trim);

    expect(isUndoable.value).toBe(false);
  });

  test("description includes the mode", () => {
    expect.hasAssertions();

    const ds = makeDataSource([makeColumn("")], [makeRow({ "": " " })]);
    setupWithDataSource(ds);
    const normalizeStrings = useNormalizeStrings();
    const { undoDescription } = useDataSourceHistory();
    normalizeStrings(NormalizeStringMode.Trim);

    expect(undoDescription.value).toBe(`Normalize Strings (${NormalizeStringMode.Trim})`);
  });
});
