import {
    makeColumn,
    makeDataSource,
    makeNumberColumn,
    makeRow,
    setupEditedItem,
    setupWithDataSource,
} from "@/composables/tableEditor/file/commands/testUtils.test";
import { useFileHistoryStore } from "@/store/tableEditor/fileHistory";
import { takeOne } from "@esposter/shared";
import { createPinia, setActivePinia } from "pinia";
import { assert, beforeEach, describe, expect, test } from "vitest";

describe(useFindReplace, () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const fileHistoryStore = useFileHistoryStore();
    const { clear } = fileHistoryStore;
    clear();
  });

  test("replaces all matching cells across rows and columns", () => {
    expect.hasAssertions();

    const ds = makeDataSource(
      [makeColumn(""), makeColumn(" ")],
      [makeRow({ "": " ", " ": " " }), makeRow({ "": " ", " ": 0 })],
    );
    const { editedItem } = setupWithDataSource(ds);
    const findReplace = useFindReplace();
    findReplace(" ", "");
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(takeOne(dataSource.rows, 0).data[""]).toBe("");
    expect(takeOne(dataSource.rows, 0).data[" "]).toBe("");
    expect(takeOne(dataSource.rows, 1).data[""]).toBe("");
    expect(takeOne(dataSource.rows, 1).data[" "]).toBe(0);
  });

  test("replaces substrings within cell values", () => {
    expect.hasAssertions();

    const ds = makeDataSource([makeColumn("")], [makeRow({ "": "a " })]);
    const { editedItem } = setupWithDataSource(ds);
    const findReplace = useFindReplace();
    findReplace(" ", "");
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(takeOne(dataSource.rows, 0).data[""]).toBe("a");
  });

  test("undo restores all original values", () => {
    expect.hasAssertions();

    const ds = makeDataSource([makeColumn("")], [makeRow({ "": " " }), makeRow({ "": " " })]);
    const { editedItem } = setupWithDataSource(ds);
    const findReplace = useFindReplace();
    const fileHistoryStore = useFileHistoryStore();
    const { undo } = fileHistoryStore;
    const editedItemValue = editedItem.value;

    assert.exists(editedItemValue);

    findReplace(" ", "");
    undo(editedItemValue);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(takeOne(dataSource.rows, 0).data[""]).toBe(" ");
    expect(takeOne(dataSource.rows, 1).data[""]).toBe(" ");
  });

  test("redo re-applies replacements after undo", () => {
    expect.hasAssertions();

    const ds = makeDataSource([makeColumn("")], [makeRow({ "": " " })]);
    const { editedItem } = setupWithDataSource(ds);
    const findReplace = useFindReplace();
    const fileHistoryStore = useFileHistoryStore();
    const { redo, undo } = fileHistoryStore;
    const editedItemValue = editedItem.value;

    assert.exists(editedItemValue);

    findReplace(" ", "");
    undo(editedItemValue);
    redo(editedItemValue);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(takeOne(dataSource.rows, 0).data[""]).toBe("");
  });

  test("replaces only the specific cell when specificCell is provided", () => {
    expect.hasAssertions();

    const ds = makeDataSource([makeColumn(""), makeColumn(" ")], [makeRow({ "": " ", " ": " " })]);
    const { editedItem } = setupWithDataSource(ds);
    const findReplace = useFindReplace();
    findReplace(" ", "", { columnName: "", rowIndex: 0 });
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(takeOne(dataSource.rows, 0).data[""]).toBe("");
    expect(takeOne(dataSource.rows, 0).data[" "]).toBe(" ");
  });

  test("no-op when find value equals replace value", () => {
    expect.hasAssertions();

    const ds = makeDataSource([makeColumn("")], [makeRow({ "": " " })]);
    const { editedItem } = setupWithDataSource(ds);
    const findReplace = useFindReplace();
    const fileHistoryStore = useFileHistoryStore();
    const { isUndoable } = storeToRefs(fileHistoryStore);
    findReplace(" ", " ");
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(takeOne(dataSource.rows, 0).data[""]).toBe(" ");
    expect(isUndoable.value).toBe(false);
  });

  test("preserves number type after replace", () => {
    expect.hasAssertions();

    const ds = makeDataSource([makeNumberColumn("")], [makeRow({ "": 1 })]);
    const { editedItem } = setupWithDataSource(ds);
    const findReplace = useFindReplace();
    findReplace("1", "2");
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(takeOne(dataSource.rows, 0).data[""]).toBe(2);
  });

  test("no-op when find value is empty", () => {
    expect.hasAssertions();

    const ds = makeDataSource([makeColumn("")], [makeRow({ "": " " })]);
    const { editedItem } = setupWithDataSource(ds);
    const findReplace = useFindReplace();
    const fileHistoryStore = useFileHistoryStore();
    const { isUndoable } = storeToRefs(fileHistoryStore);
    findReplace("", "b");
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(takeOne(dataSource.rows, 0).data[""]).toBe(" ");
    expect(isUndoable.value).toBe(false);
  });

  test("no-op when no matches found", () => {
    expect.hasAssertions();

    const fileHistoryStore = useFileHistoryStore();
    const { isUndoable } = storeToRefs(fileHistoryStore);
    setupWithDataSource();
    const findReplace = useFindReplace();
    findReplace("-1", "");

    expect(isUndoable.value).toBe(false);
  });

  test("no-op when editedItem is undefined", () => {
    expect.hasAssertions();

    const fileHistoryStore = useFileHistoryStore();
    const { isUndoable } = storeToRefs(fileHistoryStore);
    const findReplace = useFindReplace();
    findReplace(" ", "");

    expect(isUndoable.value).toBe(false);
  });

  test("no-op when dataSource is null", () => {
    expect.hasAssertions();

    setupEditedItem();
    const fileHistoryStore = useFileHistoryStore();
    const { isUndoable } = storeToRefs(fileHistoryStore);
    const findReplace = useFindReplace();
    findReplace(" ", "");

    expect(isUndoable.value).toBe(false);
  });

  test("description shows row number when replacing a single occurrence", () => {
    expect.hasAssertions();

    const ds = makeDataSource([makeColumn("")], [makeRow({ "": " " }), makeRow({ "": 0 })]);
    setupWithDataSource(ds);
    const findReplace = useFindReplace();
    const fileHistoryStore = useFileHistoryStore();
    const { undoDescription } = storeToRefs(fileHistoryStore);
    findReplace(" ", "", { columnName: "", rowIndex: 0 });

    expect(undoDescription.value).toBe(`Find & Replace " " → "" on row 1`);
  });

  test("description shows all when replacing across multiple rows", () => {
    expect.hasAssertions();

    const ds = makeDataSource([makeColumn("")], [makeRow({ "": " " }), makeRow({ "": " " })]);
    setupWithDataSource(ds);
    const findReplace = useFindReplace();
    const fileHistoryStore = useFileHistoryStore();
    const { undoDescription } = storeToRefs(fileHistoryStore);
    findReplace(" ", "");

    expect(undoDescription.value).toBe(`Find & Replace " " → "" (all)`);
  });
});
