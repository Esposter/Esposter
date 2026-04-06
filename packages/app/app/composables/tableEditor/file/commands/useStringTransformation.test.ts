import { NumberColumn } from "#shared/models/tableEditor/file/column/NumberColumn";
import { StringColumn } from "#shared/models/tableEditor/file/column/StringColumn";
import { StringTransformationType } from "#shared/models/tableEditor/file/column/transformation/string/StringTransformationType";
import {
  makeColumn,
  makeDataSource,
  makeRow,
  setupEditedItem,
  setupWithDataSource,
} from "@/composables/tableEditor/file/commands/testUtils.test";
import { useFileHistoryStore } from "@/store/tableEditor/fileHistory";
import { takeOne } from "@esposter/shared";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, assert, beforeEach, describe, expect, test } from "vitest";

describe(useStringTransformation, () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  afterEach(() => {
    const fileHistoryStore = useFileHistoryStore();
    const { clear } = fileHistoryStore;
    clear();
  });

  test(`${StringTransformationType.Trim} strips whitespace from all string cells`, () => {
    expect.hasAssertions();

    const ds = makeDataSource(
      [makeColumn(""), makeColumn(" ")],
      [makeRow({ "": " ", " ": " " }), makeRow({ "": " ", " ": " " })],
    );
    const { editedItem } = setupWithDataSource(ds);
    const stringTransformation = useStringTransformation();
    stringTransformation(StringTransformationType.Trim);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(takeOne(dataSource.rows).data[""]).toBe("");
    expect(takeOne(dataSource.rows).data[" "]).toBe("");
    expect(takeOne(dataSource.rows, 1).data[""]).toBe("");
    expect(takeOne(dataSource.rows, 1).data[" "]).toBe("");
  });

  test(`${StringTransformationType.Lowercase} lowercases all string cells`, () => {
    expect.hasAssertions();

    const ds = makeDataSource([makeColumn("")], [makeRow({ "": "A" })]);
    const { editedItem } = setupWithDataSource(ds);
    const stringTransformation = useStringTransformation();
    stringTransformation(StringTransformationType.Lowercase);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(takeOne(dataSource.rows).data[""]).toBe("a");
  });

  test(`${StringTransformationType.Uppercase} uppercases all string cells`, () => {
    expect.hasAssertions();

    const ds = makeDataSource([makeColumn("")], [makeRow({ "": "a" })]);
    const { editedItem } = setupWithDataSource(ds);
    const stringTransformation = useStringTransformation();
    stringTransformation(StringTransformationType.Uppercase);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(takeOne(dataSource.rows).data[""]).toBe("A");
  });

  test(`${StringTransformationType.TitleCase} title-cases all string cells`, () => {
    expect.hasAssertions();

    const ds = makeDataSource([makeColumn("")], [makeRow({ "": "hello world" })]);
    const { editedItem } = setupWithDataSource(ds);
    const stringTransformation = useStringTransformation();
    stringTransformation(StringTransformationType.TitleCase);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(takeOne(dataSource.rows).data[""]).toBe("Hello World");
  });

  test("skips non-string columns", () => {
    expect.hasAssertions();

    const numberColumn = new NumberColumn({ name: "", size: 0, sourceName: "" });
    const ds = makeDataSource([numberColumn], [makeRow({ "": 0 })]);
    const { editedItem } = setupWithDataSource(ds);
    const stringTransformation = useStringTransformation();
    const fileHistoryStore = useFileHistoryStore();
    const { isUndoable } = storeToRefs(fileHistoryStore);
    stringTransformation(StringTransformationType.Trim);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(takeOne(dataSource.rows).data[""]).toBe(0);
    expect(isUndoable.value).toBe(false);
  });

  test("skips hidden columns", () => {
    expect.hasAssertions();

    const hiddenColumn = new StringColumn({ hidden: true, name: "", size: 0, sourceName: "" });
    const ds = makeDataSource([hiddenColumn], [makeRow({ "": " " })]);
    const { editedItem } = setupWithDataSource(ds);
    const stringTransformation = useStringTransformation();
    const fileHistoryStore = useFileHistoryStore();
    const { isUndoable } = storeToRefs(fileHistoryStore);
    stringTransformation(StringTransformationType.Trim);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(takeOne(dataSource.rows).data[""]).toBe(" ");
    expect(isUndoable.value).toBe(false);
  });

  test("undo restores all original values", () => {
    expect.hasAssertions();

    const ds = makeDataSource([makeColumn("")], [makeRow({ "": " " }), makeRow({ "": " " })]);
    const { editedItem } = setupWithDataSource(ds);
    const stringTransformation = useStringTransformation();
    const fileHistoryStore = useFileHistoryStore();
    const { undo } = fileHistoryStore;
    const editedItemValue = editedItem.value;

    assert.exists(editedItemValue);

    stringTransformation(StringTransformationType.Trim);
    undo(editedItemValue);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(takeOne(dataSource.rows).data[""]).toBe(" ");
    expect(takeOne(dataSource.rows, 1).data[""]).toBe(" ");
  });

  test("redo re-applies after undo", () => {
    expect.hasAssertions();

    const ds = makeDataSource([makeColumn("")], [makeRow({ "": " " })]);
    const { editedItem } = setupWithDataSource(ds);
    const stringTransformation = useStringTransformation();
    const fileHistoryStore = useFileHistoryStore();
    const { redo, undo } = fileHistoryStore;
    const editedItemValue = editedItem.value;

    assert.exists(editedItemValue);

    stringTransformation(StringTransformationType.Trim);
    undo(editedItemValue);
    redo(editedItemValue);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(takeOne(dataSource.rows).data[""]).toBe("");
  });

  test("no-op when editedItem is undefined", () => {
    expect.hasAssertions();

    const fileHistoryStore = useFileHistoryStore();
    const { isUndoable } = storeToRefs(fileHistoryStore);
    const stringTransformation = useStringTransformation();
    stringTransformation(StringTransformationType.Trim);

    expect(isUndoable.value).toBe(false);
  });

  test("no-op when dataSource is null", () => {
    expect.hasAssertions();

    setupEditedItem();
    const fileHistoryStore = useFileHistoryStore();
    const { isUndoable } = storeToRefs(fileHistoryStore);
    const stringTransformation = useStringTransformation();
    stringTransformation(StringTransformationType.Trim);

    expect(isUndoable.value).toBe(false);
  });

  test("description includes the transform", () => {
    expect.hasAssertions();

    const ds = makeDataSource([makeColumn("")], [makeRow({ "": " " })]);
    setupWithDataSource(ds);
    const stringTransformation = useStringTransformation();
    const fileHistoryStore = useFileHistoryStore();
    const { undoDescription } = storeToRefs(fileHistoryStore);
    stringTransformation(StringTransformationType.Trim);

    expect(undoDescription.value).toBe(`Format Strings (${StringTransformationType.Trim})`);
  });
});
