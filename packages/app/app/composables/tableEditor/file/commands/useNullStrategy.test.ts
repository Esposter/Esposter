import { Column } from "#shared/models/tableEditor/file/column/Column";
import {
  makeColumn,
  makeDataSource,
  makeNumberColumn,
  makeRow,
  setupEditedItem,
  setupWithDataSource,
} from "@/composables/tableEditor/file/commands/testUtils.test";
import { NullStrategy } from "@/models/tableEditor/file/commands/NullStrategy";
import { useFileHistoryStore } from "@/store/tableEditor/fileHistory";
import { takeOne } from "@esposter/shared";
import { createPinia, setActivePinia } from "pinia";
import { assert, beforeEach, describe, expect, test } from "vitest";

describe(useNullStrategy, () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const fileHistoryStore = useFileHistoryStore();
    const { clear } = fileHistoryStore;
    clear();
  });

  test(`${NullStrategy.ReplaceWithNA} replaces null in string columns with "N/A"`, () => {
    expect.hasAssertions();

    const ds = makeDataSource([makeColumn("")], [makeRow({ "": null })]);
    const { editedItem } = setupWithDataSource(ds);
    const nullStrategy = useNullStrategy();
    nullStrategy(NullStrategy.ReplaceWithNA);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(takeOne(dataSource.rows, 0).data[""]).toBe("N/A");
  });

  test(`${NullStrategy.ReplaceWithNA} replaces empty string in string columns with "N/A"`, () => {
    expect.hasAssertions();

    const ds = makeDataSource([makeColumn("")], [makeRow({ "": "" })]);
    const { editedItem } = setupWithDataSource(ds);
    const nullStrategy = useNullStrategy();
    nullStrategy(NullStrategy.ReplaceWithNA);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(takeOne(dataSource.rows, 0).data[""]).toBe("N/A");
  });

  test(`${NullStrategy.ReplaceWithNA} skips non-string columns`, () => {
    expect.hasAssertions();

    const ds = makeDataSource([makeNumberColumn("")], [makeRow({ "": null })]);
    const { editedItem } = setupWithDataSource(ds);
    const nullStrategy = useNullStrategy();
    const fileHistoryStore = useFileHistoryStore();
    const { isUndoable } = storeToRefs(fileHistoryStore);
    nullStrategy(NullStrategy.ReplaceWithNA);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(takeOne(dataSource.rows, 0).data[""]).toBeNull();
    expect(isUndoable.value).toBe(false);
  });

  test(`${NullStrategy.ReplaceWithNA} skips hidden columns`, () => {
    expect.hasAssertions();

    const hiddenColumn = new Column({ hidden: true, name: "", size: 0, sourceName: "" });
    const ds = makeDataSource([hiddenColumn], [makeRow({ "": null })]);
    const { editedItem } = setupWithDataSource(ds);
    const nullStrategy = useNullStrategy();
    const fileHistoryStore = useFileHistoryStore();
    const { isUndoable } = storeToRefs(fileHistoryStore);
    nullStrategy(NullStrategy.ReplaceWithNA);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(takeOne(dataSource.rows, 0).data[""]).toBeNull();
    expect(isUndoable.value).toBe(false);
  });

  test(`${NullStrategy.DropRow} drops rows with null cells`, () => {
    expect.hasAssertions();

    const ds = makeDataSource(
      [makeColumn(""), makeColumn(" ")],
      [makeRow({ "": null, " ": " " }), makeRow({ "": " ", " ": " " })],
    );
    const { editedItem } = setupWithDataSource(ds);
    const nullStrategy = useNullStrategy();
    nullStrategy(NullStrategy.DropRow);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(dataSource.rows).toHaveLength(1);
    expect(takeOne(dataSource.rows, 0).data[""]).toBe(" ");
  });

  test(`${NullStrategy.DropRow} drops rows with empty string cells`, () => {
    expect.hasAssertions();

    const ds = makeDataSource([makeColumn("")], [makeRow({ "": "" }), makeRow({ "": " " })]);
    const { editedItem } = setupWithDataSource(ds);
    const nullStrategy = useNullStrategy();
    nullStrategy(NullStrategy.DropRow);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(dataSource.rows).toHaveLength(1);
    expect(takeOne(dataSource.rows, 0).data[""]).toBe(" ");
  });

  test(`${NullStrategy.DropRow} skips hidden columns`, () => {
    expect.hasAssertions();

    const hiddenColumn = new Column({ hidden: true, name: "", size: 0, sourceName: "" });
    const ds = makeDataSource([hiddenColumn], [makeRow({ "": null })]);
    const { editedItem } = setupWithDataSource(ds);
    const nullStrategy = useNullStrategy();
    const fileHistoryStore = useFileHistoryStore();
    const { isUndoable } = storeToRefs(fileHistoryStore);
    nullStrategy(NullStrategy.DropRow);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(dataSource.rows).toHaveLength(1);
    expect(isUndoable.value).toBe(false);
  });

  test(`${NullStrategy.ReplaceWithNA} undo restores original values`, () => {
    expect.hasAssertions();

    const ds = makeDataSource([makeColumn("")], [makeRow({ "": null }), makeRow({ "": "" })]);
    const { editedItem } = setupWithDataSource(ds);
    const nullStrategy = useNullStrategy();
    const fileHistoryStore = useFileHistoryStore();
    const { undo } = fileHistoryStore;
    const editedItemValue = editedItem.value;

    assert.exists(editedItemValue);

    nullStrategy(NullStrategy.ReplaceWithNA);
    undo(editedItemValue);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(takeOne(dataSource.rows, 0).data[""]).toBeNull();
    expect(takeOne(dataSource.rows, 1).data[""]).toBe("");
  });

  test(`${NullStrategy.DropRow} undo restores deleted rows in original positions`, () => {
    expect.hasAssertions();

    const ds = makeDataSource([makeColumn("")], [makeRow({ "": null }), makeRow({ "": " " }), makeRow({ "": "" })]);
    const { editedItem } = setupWithDataSource(ds);
    const nullStrategy = useNullStrategy();
    const fileHistoryStore = useFileHistoryStore();
    const { undo } = fileHistoryStore;
    const editedItemValue = editedItem.value;

    assert.exists(editedItemValue);

    nullStrategy(NullStrategy.DropRow);
    undo(editedItemValue);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(dataSource.rows).toHaveLength(3);
    expect(takeOne(dataSource.rows, 0).data[""]).toBeNull();
    expect(takeOne(dataSource.rows, 1).data[""]).toBe(" ");
    expect(takeOne(dataSource.rows, 2).data[""]).toBe("");
  });

  test("redo re-applies after undo", () => {
    expect.hasAssertions();

    const ds = makeDataSource([makeColumn("")], [makeRow({ "": null })]);
    const { editedItem } = setupWithDataSource(ds);
    const nullStrategy = useNullStrategy();
    const fileHistoryStore = useFileHistoryStore();
    const { redo, undo } = fileHistoryStore;
    const editedItemValue = editedItem.value;

    assert.exists(editedItemValue);

    nullStrategy(NullStrategy.ReplaceWithNA);
    undo(editedItemValue);
    redo(editedItemValue);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(takeOne(dataSource.rows, 0).data[""]).toBe("N/A");
  });

  test("no-op when editedItem is undefined", () => {
    expect.hasAssertions();

    const fileHistoryStore = useFileHistoryStore();
    const { isUndoable } = storeToRefs(fileHistoryStore);
    const nullStrategy = useNullStrategy();
    nullStrategy(NullStrategy.ReplaceWithNA);

    expect(isUndoable.value).toBe(false);
  });

  test("no-op when dataSource is null", () => {
    expect.hasAssertions();

    setupEditedItem();
    const fileHistoryStore = useFileHistoryStore();
    const { isUndoable } = storeToRefs(fileHistoryStore);
    const nullStrategy = useNullStrategy();
    nullStrategy(NullStrategy.ReplaceWithNA);

    expect(isUndoable.value).toBe(false);
  });

  test(`${NullStrategy.ReplaceWithNA} no-op when no null or empty string cells`, () => {
    expect.hasAssertions();

    const ds = makeDataSource([makeColumn("")], [makeRow({ "": " " })]);
    setupWithDataSource(ds);
    const nullStrategy = useNullStrategy();
    const fileHistoryStore = useFileHistoryStore();
    const { isUndoable } = storeToRefs(fileHistoryStore);
    nullStrategy(NullStrategy.ReplaceWithNA);

    expect(isUndoable.value).toBe(false);
  });

  test(`${NullStrategy.DropRow} no-op when no rows have null or empty string cells`, () => {
    expect.hasAssertions();

    const ds = makeDataSource([makeColumn("")], [makeRow({ "": " " })]);
    setupWithDataSource(ds);
    const nullStrategy = useNullStrategy();
    const fileHistoryStore = useFileHistoryStore();
    const { isUndoable } = storeToRefs(fileHistoryStore);
    nullStrategy(NullStrategy.DropRow);

    expect(isUndoable.value).toBe(false);
  });

  test("description includes the strategy", () => {
    expect.hasAssertions();

    const ds = makeDataSource([makeColumn("")], [makeRow({ "": null })]);
    setupWithDataSource(ds);
    const nullStrategy = useNullStrategy();
    const fileHistoryStore = useFileHistoryStore();
    const { undoDescription } = storeToRefs(fileHistoryStore);
    nullStrategy(NullStrategy.ReplaceWithNA);

    expect(undoDescription.value).toBe(`Null Strategy (${NullStrategy.ReplaceWithNA})`);
  });
});
