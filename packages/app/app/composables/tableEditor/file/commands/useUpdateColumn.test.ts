import { Column } from "#shared/models/tableEditor/file/Column";
import { DateColumn } from "#shared/models/tableEditor/file/DateColumn";
import {
  makeColumn,
  makeDataSource,
  makeDateColumn,
  makeRow,
  setupEditedItem,
  setupWithDataSource,
} from "@/composables/tableEditor/file/commands/testUtils.test";
import { useFileHistoryStore } from "@/store/tableEditor/fileHistory";
import { takeOne, toRawDeep } from "@esposter/shared";
import { createPinia, setActivePinia } from "pinia";
import { assert, beforeEach, describe, expect, test } from "vitest";

describe(useUpdateColumn, () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const fileHistoryStore = useFileHistoryStore();
    const { clear } = fileHistoryStore;
    clear();
  });

  test("sets description on column", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const updateColumn = useUpdateColumn();
    const column = takeOne(editedItem.value?.dataSource?.columns ?? [], 0);
    updateColumn("", Object.assign(structuredClone(toRawDeep(column)), { description: " " }));
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(takeOne(dataSource.columns, 0).description).toBe(" ");
  });

  test("undo restores original description", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const updateColumn = useUpdateColumn();
    const fileHistoryStore = useFileHistoryStore();
    const { undo } = fileHistoryStore;
    const column = takeOne(editedItem.value?.dataSource?.columns ?? [], 0);
    updateColumn("", Object.assign(structuredClone(toRawDeep(column)), { description: " " }));
    undo(editedItem.value);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(takeOne(dataSource.columns, 0).description).toBe("");
  });

  test("renames column and updates row keys", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const updateColumn = useUpdateColumn();
    const column = takeOne(editedItem.value?.dataSource?.columns ?? [], 0);
    updateColumn("", Object.assign(structuredClone(toRawDeep(column)), { name: "renamed" }));
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(takeOne(dataSource.columns, 0).name).toBe("renamed");
    expect(takeOne(dataSource.rows, 0).data.renamed).toBe(0);
    expect(takeOne(dataSource.rows, 0).data[""]).toBeUndefined();
  });

  test("undo restores original column name and row keys", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const updateColumn = useUpdateColumn();
    const fileHistoryStore = useFileHistoryStore();
    const { undo } = fileHistoryStore;
    const column = takeOne(editedItem.value?.dataSource?.columns ?? [], 0);
    updateColumn("", Object.assign(structuredClone(toRawDeep(column)), { name: "renamed" }));
    undo(editedItem.value);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(takeOne(dataSource.columns, 0).name).toBe("");
    expect(takeOne(dataSource.rows, 0).data[""]).toBe(0);
    expect(takeOne(dataSource.rows, 0).data.renamed).toBeUndefined();
  });

  test("redo re-applies update after undo", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const updateColumn = useUpdateColumn();
    const fileHistoryStore = useFileHistoryStore();
    const { redo, undo } = fileHistoryStore;
    const column = takeOne(editedItem.value?.dataSource?.columns ?? [], 0);
    updateColumn("", Object.assign(structuredClone(toRawDeep(column)), { name: "renamed" }));
    undo(editedItem.value);
    redo(editedItem.value);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(takeOne(dataSource.columns, 0).name).toBe("renamed");
    expect(takeOne(dataSource.rows, 0).data.renamed).toBe(0);
  });

  test("no-op when original column name not found", () => {
    expect.hasAssertions();

    setupWithDataSource();
    const updateColumn = useUpdateColumn();
    const fileHistoryStore = useFileHistoryStore();
    const { isUndoable } = storeToRefs(fileHistoryStore);
    updateColumn("-1", new Column({ name: "-1" }));

    expect(isUndoable.value).toBe(false);
  });

  test("no-op when editedItem is undefined", () => {
    expect.hasAssertions();

    const updateColumn = useUpdateColumn();
    const fileHistoryStore = useFileHistoryStore();
    const { isUndoable } = storeToRefs(fileHistoryStore);
    updateColumn("", new Column({ name: "" }));

    expect(isUndoable.value).toBe(false);
  });

  test("no-op when dataSource is null", () => {
    expect.hasAssertions();

    setupEditedItem();
    const updateColumn = useUpdateColumn();
    const fileHistoryStore = useFileHistoryStore();
    const { isUndoable } = storeToRefs(fileHistoryStore);
    updateColumn("", new Column({ name: "" }));

    expect(isUndoable.value).toBe(false);
  });

  test("preserves row.data key order after rename", () => {
    expect.hasAssertions();

    const ds = makeDataSource([makeColumn("a"), makeColumn("b"), makeColumn("c")], [makeRow({ a: 1, b: 2, c: 3 })]);
    const { editedItem } = setupWithDataSource(ds);
    const updateColumn = useUpdateColumn();
    const column = takeOne(editedItem.value?.dataSource?.columns ?? [], 1);
    updateColumn("b", Object.assign(structuredClone(toRawDeep(column)), { name: "b_renamed" }));
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(Object.keys(takeOne(dataSource.rows, 0).data)).toStrictEqual(["a", "b_renamed", "c"]);
  });

  test("undo preserves row.data key order after rename restore", () => {
    expect.hasAssertions();

    const ds = makeDataSource([makeColumn("a"), makeColumn("b"), makeColumn("c")], [makeRow({ a: 1, b: 2, c: 3 })]);
    const { editedItem } = setupWithDataSource(ds);
    const updateColumn = useUpdateColumn();
    const fileHistoryStore = useFileHistoryStore();
    const { undo } = fileHistoryStore;
    const column = takeOne(editedItem.value?.dataSource?.columns ?? [], 1);
    updateColumn("b", Object.assign(structuredClone(toRawDeep(column)), { name: "b_renamed" }));
    undo(editedItem.value);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(Object.keys(takeOne(dataSource.rows, 0).data)).toStrictEqual(["a", "b", "c"]);
  });

  test("reformats date values when format changes", () => {
    expect.hasAssertions();

    const ds = makeDataSource(
      [makeDateColumn("date", "YYYY-MM-DD")],
      [makeRow({ date: "2024-01-15" }), makeRow({ date: "2024-06-30" })],
    );
    const { editedItem } = setupWithDataSource(ds);
    const updateColumn = useUpdateColumn();
    const column = takeOne(editedItem.value?.dataSource?.columns ?? [], 0);
    updateColumn("date", Object.assign(structuredClone(toRawDeep(column)), { format: "DD/MM/YYYY" }));
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(takeOne(dataSource.rows, 0).data.date).toBe("15/01/2024");
    expect(takeOne(dataSource.rows, 1).data.date).toBe("30/06/2024");
    expect(takeOne(dataSource.columns, 0).size).toBeGreaterThan(0);
  });

  test("undo restores original date values after format change", () => {
    expect.hasAssertions();

    const ds = makeDataSource(
      [makeDateColumn("date", "YYYY-MM-DD")],
      [makeRow({ date: "2024-01-15" }), makeRow({ date: "2024-06-30" })],
    );
    const { editedItem } = setupWithDataSource(ds);
    const updateColumn = useUpdateColumn();
    const fileHistoryStore = useFileHistoryStore();
    const { undo } = fileHistoryStore;
    const originalColumn = takeOne(editedItem.value?.dataSource?.columns ?? [], 0);
    updateColumn("date", Object.assign(structuredClone(toRawDeep(originalColumn)), { format: "DD/MM/YYYY" }));
    undo(editedItem.value);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(takeOne(dataSource.rows, 0).data.date).toBe("2024-01-15");
    expect(takeOne(dataSource.rows, 1).data.date).toBe("2024-06-30");

    const updatedColumn = takeOne(dataSource.columns, 0);

    assert.instanceOf(updatedColumn, DateColumn);

    expect(updatedColumn.format).toBe("YYYY-MM-DD");
  });

  test("snapshot immutability - mutating passed object after call does not affect undo history", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const updateColumn = useUpdateColumn();
    const fileHistoryStore = useFileHistoryStore();
    const { redo, undo } = fileHistoryStore;
    const column = takeOne(editedItem.value?.dataSource?.columns ?? [], 0);
    const updatedColumn = reactive(Object.assign(structuredClone(toRawDeep(column)), { name: "renamed" }));
    updateColumn("", updatedColumn);
    updatedColumn.name = "mutated";
    undo(editedItem.value);
    const dataSourceAfterUndo = editedItem.value?.dataSource;

    assert.exists(dataSourceAfterUndo);

    expect(takeOne(dataSourceAfterUndo.columns, 0).name).toBe("");

    redo(editedItem.value);
    const dataSourceAfterRedo = editedItem.value?.dataSource;

    assert.exists(dataSourceAfterRedo);

    expect(takeOne(dataSourceAfterRedo.columns, 0).name).toBe("renamed");
  });
});
