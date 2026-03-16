import { Column } from "#shared/models/tableEditor/file/Column";
import { expectToBeDefined } from "#shared/test/expectToBeDefined";
import { setupEditedItem, setupWithDataSource } from "@/composables/tableEditor/file/commands/testUtils.test";
import { takeOne, toRawDeep } from "@esposter/shared";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useUpdateColumn, () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const { clear } = useDataSourceHistory();
    clear();
  });

  test("sets description on column", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const updateColumn = useUpdateColumn();
    const column = takeOne(editedItem.value?.dataSource?.columns ?? [], 0);
    updateColumn("", Object.assign(structuredClone(toRawDeep(column)), { description: " " }));
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(takeOne(dataSource.columns, 0).description).toBe(" ");
  });

  test("undo restores original description", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const updateColumn = useUpdateColumn();
    const { undo } = useDataSourceHistory();
    const column = takeOne(editedItem.value?.dataSource?.columns ?? [], 0);
    updateColumn("", Object.assign(structuredClone(toRawDeep(column)), { description: " " }));
    undo(editedItem.value);
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(takeOne(dataSource.columns, 0).description).toBe("");
  });

  test("renames column and updates row keys", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const updateColumn = useUpdateColumn();
    const column = takeOne(editedItem.value?.dataSource?.columns ?? [], 0);
    updateColumn("", Object.assign(structuredClone(toRawDeep(column)), { name: "renamed" }));
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(takeOne(dataSource.columns, 0).name).toBe("renamed");
    expect(takeOne(dataSource.rows, 0).data.renamed).toBe(0);
    expect(takeOne(dataSource.rows, 0).data[""]).toBeUndefined();
  });

  test("undo restores original column name and row keys", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const updateColumn = useUpdateColumn();
    const { undo } = useDataSourceHistory();
    const column = takeOne(editedItem.value?.dataSource?.columns ?? [], 0);
    updateColumn("", Object.assign(structuredClone(toRawDeep(column)), { name: "renamed" }));
    undo(editedItem.value);
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(takeOne(dataSource.columns, 0).name).toBe("");
    expect(takeOne(dataSource.rows, 0).data[""]).toBe(0);
    expect(takeOne(dataSource.rows, 0).data.renamed).toBeUndefined();
  });

  test("redo re-applies update after undo", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const updateColumn = useUpdateColumn();
    const { redo, undo } = useDataSourceHistory();
    const column = takeOne(editedItem.value?.dataSource?.columns ?? [], 0);
    updateColumn("", Object.assign(structuredClone(toRawDeep(column)), { name: "renamed" }));
    undo(editedItem.value);
    redo(editedItem.value);
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(takeOne(dataSource.columns, 0).name).toBe("renamed");
    expect(takeOne(dataSource.rows, 0).data.renamed).toBe(0);
  });

  test("no-op when original column name not found", () => {
    expect.hasAssertions();

    setupWithDataSource();
    const updateColumn = useUpdateColumn();
    const { isUndoable } = useDataSourceHistory();
    updateColumn("nonexistent", new Column({ name: "nonexistent" }));

    expect(isUndoable.value).toBe(false);
  });

  test("no-op when editedItem is undefined", () => {
    expect.hasAssertions();

    const updateColumn = useUpdateColumn();
    const { isUndoable } = useDataSourceHistory();
    updateColumn("", new Column({ name: "" }));

    expect(isUndoable.value).toBe(false);
  });

  test("no-op when dataSource is null", () => {
    expect.hasAssertions();

    setupEditedItem();
    const updateColumn = useUpdateColumn();
    const { isUndoable } = useDataSourceHistory();
    updateColumn("", new Column({ name: "" }));

    expect(isUndoable.value).toBe(false);
  });

  test("snapshot immutability - mutating passed object after call does not affect undo history", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const updateColumn = useUpdateColumn();
    const { redo, undo } = useDataSourceHistory();
    const column = takeOne(editedItem.value?.dataSource?.columns ?? [], 0);
    const updatedColumn = reactive(Object.assign(structuredClone(toRawDeep(column)), { name: "renamed" }));
    updateColumn("", updatedColumn);
    updatedColumn.name = "mutated";
    undo(editedItem.value);
    const dataSourceAfterUndo = editedItem.value?.dataSource;

    expectToBeDefined(dataSourceAfterUndo);

    expect(takeOne(dataSourceAfterUndo.columns, 0).name).toBe("");

    redo(editedItem.value);
    const dataSourceAfterRedo = editedItem.value?.dataSource;

    expectToBeDefined(dataSourceAfterRedo);

    expect(takeOne(dataSourceAfterRedo.columns, 0).name).toBe("renamed");
  });
});
