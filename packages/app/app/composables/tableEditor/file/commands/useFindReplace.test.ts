import { expectToBeDefined } from "#shared/test/expectToBeDefined";
import {
  makeColumn,
  makeDataSource,
  makeRow,
  setupEditedItem,
  setupWithDataSource,
} from "@/composables/tableEditor/file/commands/testUtils.test";
import { takeOne } from "@esposter/shared";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useFindReplace, () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const { clear } = useDataSourceHistory();
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

    expectToBeDefined(dataSource);

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

    expectToBeDefined(dataSource);

    expect(takeOne(dataSource.rows, 0).data[""]).toBe("a");
  });

  test("undo restores all original values", () => {
    expect.hasAssertions();

    const ds = makeDataSource([makeColumn("")], [makeRow({ "": " " }), makeRow({ "": " " })]);
    const { editedItem } = setupWithDataSource(ds);
    const findReplace = useFindReplace();
    const { undo } = useDataSourceHistory();
    const editedItemValue = editedItem.value;

    expectToBeDefined(editedItemValue);

    findReplace(" ", "");
    undo(editedItemValue);
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(takeOne(dataSource.rows, 0).data[""]).toBe(" ");
    expect(takeOne(dataSource.rows, 1).data[""]).toBe(" ");
  });

  test("redo re-applies replacements after undo", () => {
    expect.hasAssertions();

    const ds = makeDataSource([makeColumn("")], [makeRow({ "": " " })]);
    const { editedItem } = setupWithDataSource(ds);
    const findReplace = useFindReplace();
    const { redo, undo } = useDataSourceHistory();
    const editedItemValue = editedItem.value;

    expectToBeDefined(editedItemValue);

    findReplace(" ", "");
    undo(editedItemValue);
    redo(editedItemValue);
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(takeOne(dataSource.rows, 0).data[""]).toBe("");
  });

  test("replaces only the specific cell when specificCell is provided", () => {
    expect.hasAssertions();

    const ds = makeDataSource([makeColumn(""), makeColumn(" ")], [makeRow({ "": " ", " ": " " })]);
    const { editedItem } = setupWithDataSource(ds);
    const findReplace = useFindReplace();
    findReplace(" ", "", { columnName: "", rowIndex: 0 });
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(takeOne(dataSource.rows, 0).data[""]).toBe("");
    expect(takeOne(dataSource.rows, 0).data[" "]).toBe(" ");
  });

  test("no-op when find value is empty", () => {
    expect.hasAssertions();

    const ds = makeDataSource([makeColumn("")], [makeRow({ "": " " })]);
    const { editedItem } = setupWithDataSource(ds);
    const findReplace = useFindReplace();
    const { isUndoable } = useDataSourceHistory();
    findReplace("", "b");
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(takeOne(dataSource.rows, 0).data[""]).toBe(" ");
    expect(isUndoable.value).toBe(false);
  });

  test("no-op when no matches found", () => {
    expect.hasAssertions();

    const { isUndoable } = useDataSourceHistory();
    setupWithDataSource();
    const findReplace = useFindReplace();
    findReplace("-1", "");

    expect(isUndoable.value).toBe(false);
  });

  test("no-op when editedItem is undefined", () => {
    expect.hasAssertions();

    const { isUndoable } = useDataSourceHistory();
    const findReplace = useFindReplace();
    findReplace(" ", "");

    expect(isUndoable.value).toBe(false);
  });

  test("no-op when dataSource is null", () => {
    expect.hasAssertions();

    setupEditedItem();
    const { isUndoable } = useDataSourceHistory();
    const findReplace = useFindReplace();
    findReplace(" ", "");

    expect(isUndoable.value).toBe(false);
  });
});
