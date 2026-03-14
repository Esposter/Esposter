import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";

import { Column } from "#shared/models/tableEditor/file/Column";
import { CsvDataSourceItem } from "#shared/models/tableEditor/file/csv/CsvDataSourceItem";
import { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";
import { Row } from "#shared/models/tableEditor/file/Row";
import { expectToBeDefined } from "#shared/test/expectToBeDefined";
import { useDataSourceHistory } from "@/composables/tableEditor/file/useDataSourceHistory";
import { useEditedItemDataSourceOperations } from "@/composables/tableEditor/file/useEditedItemDataSourceOperations";
import { useTableEditorStore } from "@/store/tableEditor";
import { useItemStore } from "@/store/tableEditor/item";
import { takeOne, toRawDeep } from "@esposter/shared";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useEditedItemDataSourceOperations, () => {
  const createDataSource = (columns: Column[] = [], rows: Row[] = []): DataSource => ({
    columns,
    metadata: { dataSourceType: DataSourceType.Csv, importedAt: new Date(0), name: "", size: 0 },
    rows,
    stats: { columnCount: columns.length, rowCount: rows.length, size: 0 },
  });

  const createColumn = (name: string): Column => new Column({ name, size: 0, sourceName: name });

  const createRow = (data: Record<string, boolean | null | number | string>): Row => new Row({ data });

  const setupEditedItem = () => {
    const tableEditorStore = useTableEditorStore<DataSourceItemTypeMap[keyof DataSourceItemTypeMap]>();
    const { editedItem } = storeToRefs(tableEditorStore);
    const itemStore = useItemStore();
    const { createItem } = itemStore;
    const item = new CsvDataSourceItem();
    createItem(item);
    editedItem.value = item;
    return { editedItem, item };
  };

  const setupWithDataSource = (dataSource?: DataSource) => {
    const { editedItem, item } = setupEditedItem();
    const ds =
      dataSource ??
      createDataSource(
        [createColumn(""), createColumn(" ")],
        [createRow({ "": 0, " ": 1 }), createRow({ "": 2, " ": 3 })],
      );
    const operations = useEditedItemDataSourceOperations();
    operations.setDataSource(ds);
    return { editedItem, item, operations };
  };

  beforeEach(() => {
    const { clear } = useDataSourceHistory();
    setActivePinia(createPinia());
    clear();
  });

  describe("setDataSource", () => {
    test("sets data source on edited item", () => {
      expect.hasAssertions();

      const { editedItem } = setupEditedItem();
      const { setDataSource } = useEditedItemDataSourceOperations();
      const dataSource = createDataSource();
      setDataSource(dataSource);
      const editedItemValue = editedItem.value;

      expectToBeDefined(editedItemValue);

      expect(editedItemValue.dataSource).toStrictEqual(dataSource);
    });

    test("clears history after setting data source", () => {
      expect.hasAssertions();

      const { operations } = setupWithDataSource();
      const { deleteRow, isUndoable, setDataSource } = operations;
      deleteRow(0);

      expect(isUndoable.value).toBe(true);

      setDataSource(createDataSource());

      expect(isUndoable.value).toBe(false);
    });

    test("no-op when editedItem is undefined", () => {
      expect.hasAssertions();

      const { setDataSource } = useEditedItemDataSourceOperations();
      setDataSource(createDataSource());

      const tableEditorStore = useTableEditorStore<DataSourceItemTypeMap[keyof DataSourceItemTypeMap]>();
      const { editedItem } = storeToRefs(tableEditorStore);

      expect(editedItem.value).toBeUndefined();
    });
  });

  describe("deleteRow", () => {
    test("removes row at given index", () => {
      expect.hasAssertions();

      const { editedItem, operations } = setupWithDataSource();
      const { deleteRow } = operations;
      deleteRow(0);
      const dataSource = editedItem.value?.dataSource;

      expectToBeDefined(dataSource);

      expect(dataSource.rows).toHaveLength(1);
      expect(takeOne(dataSource.rows, 0).data[""]).toBe(2);
    });

    test("undo restores deleted row", () => {
      expect.hasAssertions();

      const { editedItem, operations } = setupWithDataSource();
      const { deleteRow, undo } = operations;
      deleteRow(0);
      undo();
      const dataSource = editedItem.value?.dataSource;

      expectToBeDefined(dataSource);

      expect(dataSource.rows).toHaveLength(2);
      expect(takeOne(dataSource.rows, 0).data[""]).toBe(0);
    });

    test("redo re-applies delete after undo", () => {
      expect.hasAssertions();

      const { editedItem, operations } = setupWithDataSource();
      const { deleteRow, redo, undo } = operations;
      deleteRow(0);
      undo();
      redo();
      const dataSource = editedItem.value?.dataSource;

      expectToBeDefined(dataSource);

      expect(dataSource.rows).toHaveLength(1);
      expect(takeOne(dataSource.rows, 0).data[""]).toBe(2);
    });

    test("no-op when editedItem is undefined", () => {
      expect.hasAssertions();

      const { deleteRow, isUndoable } = useEditedItemDataSourceOperations();
      deleteRow(0);

      expect(isUndoable.value).toBe(false);
    });

    test("no-op when dataSource is null", () => {
      expect.hasAssertions();

      setupEditedItem();
      const { deleteRow, isUndoable } = useEditedItemDataSourceOperations();
      deleteRow(0);

      expect(isUndoable.value).toBe(false);
    });
  });

  describe("updateRow", () => {
    test("updates row data at given index", () => {
      expect.hasAssertions();

      const { editedItem, operations } = setupWithDataSource();
      const { updateRow } = operations;
      updateRow(0, createRow({ "": 10, " ": 11 }));
      const dataSource = editedItem.value?.dataSource;

      expectToBeDefined(dataSource);

      expect(takeOne(dataSource.rows, 0).data[""]).toBe(10);
      expect(takeOne(dataSource.rows, 0).data[" "]).toBe(11);
    });

    test("undo restores original row data", () => {
      expect.hasAssertions();

      const { editedItem, operations } = setupWithDataSource();
      const { undo, updateRow } = operations;
      updateRow(0, createRow({ "": 10, " ": 11 }));
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
      updateRow(0, createRow({ "": 10, " ": 11 }));
      undo();
      redo();
      const dataSource = editedItem.value?.dataSource;

      expectToBeDefined(dataSource);

      expect(takeOne(dataSource.rows, 0).data[""]).toBe(10);
    });

    test("no-op when index is -1", () => {
      expect.hasAssertions();

      const { operations } = setupWithDataSource();
      const { isUndoable, updateRow } = operations;
      updateRow(-1, createRow({ "": 10 }));

      expect(isUndoable.value).toBe(false);
    });

    test("no-op when editedItem is undefined", () => {
      expect.hasAssertions();

      const { isUndoable, updateRow } = useEditedItemDataSourceOperations();
      updateRow(0, createRow({ "": 10 }));

      expect(isUndoable.value).toBe(false);
    });

    test("no-op when dataSource is null", () => {
      expect.hasAssertions();

      setupEditedItem();
      const { isUndoable, updateRow } = useEditedItemDataSourceOperations();
      updateRow(0, createRow({ "": 10 }));

      expect(isUndoable.value).toBe(false);
    });

    test("snapshot immutability - mutating passed object after call does not affect undo history", () => {
      expect.hasAssertions();

      const { editedItem, operations } = setupWithDataSource();
      const { redo, undo, updateRow } = operations;
      const updatedRow = reactive(createRow({ "": 10, " ": 11 }));
      updateRow(0, updatedRow);
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

  describe("deleteColumn", () => {
    test("removes column by name", () => {
      expect.hasAssertions();

      const { editedItem, operations } = setupWithDataSource();
      const { deleteColumn } = operations;
      deleteColumn("");
      const dataSource = editedItem.value?.dataSource;

      expectToBeDefined(dataSource);

      expect(dataSource.columns).toHaveLength(1);
      expect(takeOne(dataSource.columns, 0).name).toBe(" ");
      expect(takeOne(dataSource.rows, 0).data[""]).toBeUndefined();
    });

    test("undo restores deleted column and row values", () => {
      expect.hasAssertions();

      const { editedItem, operations } = setupWithDataSource();
      const { deleteColumn, undo } = operations;
      deleteColumn("");
      undo();
      const dataSource = editedItem.value?.dataSource;

      expectToBeDefined(dataSource);

      expect(dataSource.columns).toHaveLength(2);
      expect(takeOne(dataSource.columns, 0).name).toBe("");
      expect(takeOne(dataSource.rows, 0).data[""]).toBe(0);
      expect(takeOne(dataSource.rows, 1).data[""]).toBe(2);
    });

    test("redo re-applies delete after undo", () => {
      expect.hasAssertions();

      const { editedItem, operations } = setupWithDataSource();
      const { deleteColumn, redo, undo } = operations;
      deleteColumn("");
      undo();
      redo();
      const dataSource = editedItem.value?.dataSource;

      expectToBeDefined(dataSource);

      expect(dataSource.columns).toHaveLength(1);
      expect(takeOne(dataSource.rows, 0).data[""]).toBeUndefined();
    });

    test("no-op when column name not found", () => {
      expect.hasAssertions();

      const { operations } = setupWithDataSource();
      const { deleteColumn, isUndoable } = operations;
      deleteColumn("nonexistent");

      expect(isUndoable.value).toBe(false);
    });

    test("no-op when editedItem is undefined", () => {
      expect.hasAssertions();

      const { deleteColumn, isUndoable } = useEditedItemDataSourceOperations();
      deleteColumn("");

      expect(isUndoable.value).toBe(false);
    });

    test("no-op when dataSource is null", () => {
      expect.hasAssertions();

      setupEditedItem();
      const { deleteColumn, isUndoable } = useEditedItemDataSourceOperations();
      deleteColumn("");

      expect(isUndoable.value).toBe(false);
    });
  });

  describe("toggleColumnVisibility", () => {
    test("hides a visible column", () => {
      expect.hasAssertions();

      const { editedItem, operations } = setupWithDataSource();
      const { toggleColumnVisibility } = operations;
      const column = takeOne(editedItem.value?.dataSource?.columns ?? [], 0);
      toggleColumnVisibility(column.id);
      const dataSource = editedItem.value?.dataSource;

      expectToBeDefined(dataSource);

      expect(takeOne(dataSource.columns, 0).hidden).toBe(true);
    });

    test("shows a hidden column", () => {
      expect.hasAssertions();

      const hiddenColumn = new Column({ hidden: true, name: "" });
      const { editedItem, operations } = setupWithDataSource(createDataSource([hiddenColumn], [createRow({ "": 0 })]));
      const { toggleColumnVisibility } = operations;
      toggleColumnVisibility(hiddenColumn.id);
      const dataSource = editedItem.value?.dataSource;

      expectToBeDefined(dataSource);

      expect(takeOne(dataSource.columns, 0).hidden).toBe(false);
    });

    test("undo restores original visibility", () => {
      expect.hasAssertions();

      const { editedItem, operations } = setupWithDataSource();
      const { toggleColumnVisibility, undo } = operations;
      const column = takeOne(editedItem.value?.dataSource?.columns ?? [], 0);
      toggleColumnVisibility(column.id);
      undo();
      const dataSource = editedItem.value?.dataSource;

      expectToBeDefined(dataSource);

      expect(takeOne(dataSource.columns, 0).hidden).toBe(false);
    });

    test("redo re-applies toggle after undo", () => {
      expect.hasAssertions();

      const { editedItem, operations } = setupWithDataSource();
      const { redo, toggleColumnVisibility, undo } = operations;
      const column = takeOne(editedItem.value?.dataSource?.columns ?? [], 0);
      toggleColumnVisibility(column.id);
      undo();
      redo();
      const dataSource = editedItem.value?.dataSource;

      expectToBeDefined(dataSource);

      expect(takeOne(dataSource.columns, 0).hidden).toBe(true);
    });

    test("no-op when column id not found", () => {
      expect.hasAssertions();

      const { operations } = setupWithDataSource();
      const { isUndoable, toggleColumnVisibility } = operations;
      toggleColumnVisibility("nonexistent");

      expect(isUndoable.value).toBe(false);
    });

    test("no-op when editedItem is undefined", () => {
      expect.hasAssertions();

      const { isUndoable, toggleColumnVisibility } = useEditedItemDataSourceOperations();
      toggleColumnVisibility("");

      expect(isUndoable.value).toBe(false);
    });

    test("no-op when dataSource is null", () => {
      expect.hasAssertions();

      setupEditedItem();
      const { isUndoable, toggleColumnVisibility } = useEditedItemDataSourceOperations();
      toggleColumnVisibility("");

      expect(isUndoable.value).toBe(false);
    });
  });

  describe("updateColumn", () => {
    test("sets description on column", () => {
      expect.hasAssertions();

      const { editedItem, operations } = setupWithDataSource();
      const { updateColumn } = operations;
      const column = takeOne(editedItem.value?.dataSource?.columns ?? [], 0);
      updateColumn("", Object.assign(structuredClone(toRawDeep(column)), { description: " " }));
      const dataSource = editedItem.value?.dataSource;

      expectToBeDefined(dataSource);

      expect(takeOne(dataSource.columns, 0).description).toBe(" ");
    });

    test("undo restores original description", () => {
      expect.hasAssertions();

      const { editedItem, operations } = setupWithDataSource();
      const { undo, updateColumn } = operations;
      const column = takeOne(editedItem.value?.dataSource?.columns ?? [], 0);
      updateColumn("", Object.assign(structuredClone(toRawDeep(column)), { description: " " }));
      undo();
      const dataSource = editedItem.value?.dataSource;

      expectToBeDefined(dataSource);

      expect(takeOne(dataSource.columns, 0).description).toBe("");
    });

    test("renames column and updates row keys", () => {
      expect.hasAssertions();

      const { editedItem, operations } = setupWithDataSource();
      const { updateColumn } = operations;
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

      const { editedItem, operations } = setupWithDataSource();
      const { undo, updateColumn } = operations;
      const column = takeOne(editedItem.value?.dataSource?.columns ?? [], 0);
      updateColumn("", Object.assign(structuredClone(toRawDeep(column)), { name: "renamed" }));
      undo();
      const dataSource = editedItem.value?.dataSource;

      expectToBeDefined(dataSource);

      expect(takeOne(dataSource.columns, 0).name).toBe("");
      expect(takeOne(dataSource.rows, 0).data[""]).toBe(0);
      expect(takeOne(dataSource.rows, 0).data.renamed).toBeUndefined();
    });

    test("redo re-applies update after undo", () => {
      expect.hasAssertions();

      const { editedItem, operations } = setupWithDataSource();
      const { redo, undo, updateColumn } = operations;
      const column = takeOne(editedItem.value?.dataSource?.columns ?? [], 0);
      updateColumn("", Object.assign(structuredClone(toRawDeep(column)), { name: "renamed" }));
      undo();
      redo();
      const dataSource = editedItem.value?.dataSource;

      expectToBeDefined(dataSource);

      expect(takeOne(dataSource.columns, 0).name).toBe("renamed");
      expect(takeOne(dataSource.rows, 0).data.renamed).toBe(0);
    });

    test("no-op when original column name not found", () => {
      expect.hasAssertions();

      const { operations } = setupWithDataSource();
      const { isUndoable, updateColumn } = operations;
      updateColumn("nonexistent", new Column({ name: "nonexistent" }));

      expect(isUndoable.value).toBe(false);
    });

    test("no-op when editedItem is undefined", () => {
      expect.hasAssertions();

      const { isUndoable, updateColumn } = useEditedItemDataSourceOperations();
      updateColumn("", new Column({ name: "" }));

      expect(isUndoable.value).toBe(false);
    });

    test("no-op when dataSource is null", () => {
      expect.hasAssertions();

      setupEditedItem();
      const { isUndoable, updateColumn } = useEditedItemDataSourceOperations();
      updateColumn("", new Column({ name: "" }));

      expect(isUndoable.value).toBe(false);
    });

    test("snapshot immutability - mutating passed object after call does not affect undo history", () => {
      expect.hasAssertions();

      const { editedItem, operations } = setupWithDataSource();
      const { redo, undo, updateColumn } = operations;
      const column = takeOne(editedItem.value?.dataSource?.columns ?? [], 0);
      const updatedColumn = reactive(Object.assign(structuredClone(toRawDeep(column)), { name: "renamed" }));
      updateColumn("", updatedColumn);
      updatedColumn.name = "mutated";
      undo();
      const dataSourceAfterUndo = editedItem.value?.dataSource;

      expectToBeDefined(dataSourceAfterUndo);

      expect(takeOne(dataSourceAfterUndo.columns, 0).name).toBe("");

      redo();
      const dataSourceAfterRedo = editedItem.value?.dataSource;

      expectToBeDefined(dataSourceAfterRedo);

      expect(takeOne(dataSourceAfterRedo.columns, 0).name).toBe("renamed");
    });
  });

  describe("createRow", () => {
    test("appends a new row with null values for all columns", () => {
      expect.hasAssertions();

      const { editedItem, operations } = setupWithDataSource();
      const { createRow } = operations;
      createRow();
      const dataSource = editedItem.value?.dataSource;

      expectToBeDefined(dataSource);

      expect(dataSource.rows).toHaveLength(3);
      expect(takeOne(dataSource.rows, 2).data[""]).toBeNull();
      expect(takeOne(dataSource.rows, 2).data[" "]).toBeNull();
    });

    test("appends a pre-built row with provided data", () => {
      expect.hasAssertions();

      const { editedItem, operations } = setupWithDataSource();
      const { createRow } = operations;
      createRow(new Row({ data: { "": 0, " ": 1 } }));
      const dataSource = editedItem.value?.dataSource;

      expectToBeDefined(dataSource);

      expect(dataSource.rows).toHaveLength(3);
      expect(takeOne(dataSource.rows, 2).data[""]).toBe(0);
      expect(takeOne(dataSource.rows, 2).data[" "]).toBe(1);
    });

    test("undo removes the created row", () => {
      expect.hasAssertions();

      const { editedItem, operations } = setupWithDataSource();
      const { createRow, undo } = operations;
      createRow();
      undo();
      const dataSource = editedItem.value?.dataSource;

      expectToBeDefined(dataSource);

      expect(dataSource.rows).toHaveLength(2);
    });

    test("redo re-applies create after undo", () => {
      expect.hasAssertions();

      const { editedItem, operations } = setupWithDataSource();
      const { createRow, redo, undo } = operations;
      createRow();
      undo();
      redo();
      const dataSource = editedItem.value?.dataSource;

      expectToBeDefined(dataSource);

      expect(dataSource.rows).toHaveLength(3);
    });

    test("no-op when editedItem is undefined", () => {
      expect.hasAssertions();

      const { createRow, isUndoable } = useEditedItemDataSourceOperations();
      createRow();

      expect(isUndoable.value).toBe(false);
    });

    test("no-op when dataSource is null", () => {
      expect.hasAssertions();

      setupEditedItem();
      const { createRow, isUndoable } = useEditedItemDataSourceOperations();
      createRow();

      expect(isUndoable.value).toBe(false);
    });
  });

  describe("createColumn", () => {
    test("appends a new column with null values for all rows", () => {
      expect.hasAssertions();

      const { editedItem, operations } = setupWithDataSource();
      const { createColumn } = operations;
      createColumn(new Column({ name: "new", sourceName: "new" }));
      const dataSource = editedItem.value?.dataSource;

      expectToBeDefined(dataSource);

      expect(dataSource.columns).toHaveLength(3);
      expect(takeOne(dataSource.columns, 2).name).toBe("new");
      expect(takeOne(dataSource.rows, 0).data.new).toBeNull();
      expect(takeOne(dataSource.rows, 1).data.new).toBeNull();
    });

    test("undo removes the created column and its row values", () => {
      expect.hasAssertions();

      const { editedItem, operations } = setupWithDataSource();
      const { createColumn, undo } = operations;
      createColumn(new Column({ name: "new", sourceName: "new" }));
      undo();
      const dataSource = editedItem.value?.dataSource;

      expectToBeDefined(dataSource);

      expect(dataSource.columns).toHaveLength(2);
      expect(takeOne(dataSource.rows, 0).data.new).toBeUndefined();
    });

    test("redo re-applies create after undo", () => {
      expect.hasAssertions();

      const { editedItem, operations } = setupWithDataSource();
      const { createColumn, redo, undo } = operations;
      createColumn(new Column({ name: "new", sourceName: "new" }));
      undo();
      redo();
      const dataSource = editedItem.value?.dataSource;

      expectToBeDefined(dataSource);

      expect(dataSource.columns).toHaveLength(3);
      expect(takeOne(dataSource.rows, 0).data.new).toBeNull();
    });

    test("no-op when editedItem is undefined", () => {
      expect.hasAssertions();

      const { createColumn, isUndoable } = useEditedItemDataSourceOperations();
      createColumn(new Column({ name: "new", sourceName: "new" }));

      expect(isUndoable.value).toBe(false);
    });

    test("no-op when dataSource is null", () => {
      expect.hasAssertions();

      setupEditedItem();
      const { createColumn, isUndoable } = useEditedItemDataSourceOperations();
      createColumn(new Column({ name: "new", sourceName: "new" }));

      expect(isUndoable.value).toBe(false);
    });
  });

  describe("reorderColumns", () => {
    test("moves column forward (index 0 to 1)", () => {
      expect.hasAssertions();

      const { editedItem, operations } = setupWithDataSource();
      const { reorderColumns } = operations;
      const columns = editedItem.value?.dataSource?.columns ?? [];
      const newColumns = [takeOne(columns, 1), takeOne(columns, 0)] as Column[];
      reorderColumns(newColumns);
      const dataSource = editedItem.value?.dataSource;

      expectToBeDefined(dataSource);

      expect(takeOne(dataSource.columns, 0).name).toBe(" ");
      expect(takeOne(dataSource.columns, 1).name).toBe("");
    });

    test("undo restores original column order", () => {
      expect.hasAssertions();

      const { editedItem, operations } = setupWithDataSource();
      const { reorderColumns, undo } = operations;
      const columns = editedItem.value?.dataSource?.columns ?? [];
      const newColumns = [takeOne(columns, 1), takeOne(columns, 0)] as Column[];
      reorderColumns(newColumns);
      undo();
      const dataSource = editedItem.value?.dataSource;

      expectToBeDefined(dataSource);

      expect(takeOne(dataSource.columns, 0).name).toBe("");
      expect(takeOne(dataSource.columns, 1).name).toBe(" ");
    });

    test("redo re-applies reorder after undo", () => {
      expect.hasAssertions();

      const { editedItem, operations } = setupWithDataSource();
      const { redo, reorderColumns, undo } = operations;
      const columns = editedItem.value?.dataSource?.columns ?? [];
      const newColumns = [takeOne(columns, 1), takeOne(columns, 0)] as Column[];
      reorderColumns(newColumns);
      undo();
      redo();
      const dataSource = editedItem.value?.dataSource;

      expectToBeDefined(dataSource);

      expect(takeOne(dataSource.columns, 0).name).toBe(" ");
      expect(takeOne(dataSource.columns, 1).name).toBe("");
    });

    test("moves column backward (index 1 to 0) with three columns", () => {
      expect.hasAssertions();

      const threeColumnDs = createDataSource(
        [createColumn("a"), createColumn("b"), createColumn("c")],
        [createRow({ a: 0, b: 1, c: 2 })],
      );
      const { editedItem, operations } = setupWithDataSource(threeColumnDs);
      const { reorderColumns } = operations;
      const columns = editedItem.value?.dataSource?.columns ?? [];
      const newColumns = [takeOne(columns, 1), takeOne(columns, 0), takeOne(columns, 2)] as Column[];
      reorderColumns(newColumns);
      const dataSource = editedItem.value?.dataSource;

      expectToBeDefined(dataSource);

      expect(takeOne(dataSource.columns, 0).name).toBe("b");
      expect(takeOne(dataSource.columns, 1).name).toBe("a");
      expect(takeOne(dataSource.columns, 2).name).toBe("c");
    });

    test("no-op when order unchanged", () => {
      expect.hasAssertions();

      const { editedItem, operations } = setupWithDataSource();
      const { isUndoable, reorderColumns } = operations;
      const columns = editedItem.value?.dataSource?.columns ?? [];
      reorderColumns([...columns]);

      expect(isUndoable.value).toBe(false);
    });

    test("no-op when editedItem is undefined", () => {
      expect.hasAssertions();

      const { isUndoable, reorderColumns } = useEditedItemDataSourceOperations();
      reorderColumns([]);

      expect(isUndoable.value).toBe(false);
    });

    test("no-op when dataSource is null", () => {
      expect.hasAssertions();

      setupEditedItem();
      const { isUndoable, reorderColumns } = useEditedItemDataSourceOperations();
      reorderColumns([]);

      expect(isUndoable.value).toBe(false);
    });
  });

  describe("reorderRows", () => {
    test("moves row forward (index 0 to 1)", () => {
      expect.hasAssertions();

      const { editedItem, operations } = setupWithDataSource();
      const { reorderRows } = operations;
      const rows = editedItem.value?.dataSource?.rows ?? [];
      const newRows = [takeOne(rows, 1), takeOne(rows, 0)] as Row[];
      reorderRows(newRows);
      const dataSource = editedItem.value?.dataSource;

      expectToBeDefined(dataSource);

      expect(takeOne(dataSource.rows, 0).data[""]).toBe(2);
      expect(takeOne(dataSource.rows, 1).data[""]).toBe(0);
    });

    test("undo restores original row order", () => {
      expect.hasAssertions();

      const { editedItem, operations } = setupWithDataSource();
      const { reorderRows, undo } = operations;
      const rows = editedItem.value?.dataSource?.rows ?? [];
      const newRows = [takeOne(rows, 1), takeOne(rows, 0)] as Row[];
      reorderRows(newRows);
      undo();
      const dataSource = editedItem.value?.dataSource;

      expectToBeDefined(dataSource);

      expect(takeOne(dataSource.rows, 0).data[""]).toBe(0);
      expect(takeOne(dataSource.rows, 1).data[""]).toBe(2);
    });

    test("redo re-applies reorder after undo", () => {
      expect.hasAssertions();

      const { editedItem, operations } = setupWithDataSource();
      const { redo, reorderRows, undo } = operations;
      const rows = editedItem.value?.dataSource?.rows ?? [];
      const newRows = [takeOne(rows, 1), takeOne(rows, 0)] as Row[];
      reorderRows(newRows);
      undo();
      redo();
      const dataSource = editedItem.value?.dataSource;

      expectToBeDefined(dataSource);

      expect(takeOne(dataSource.rows, 0).data[""]).toBe(2);
      expect(takeOne(dataSource.rows, 1).data[""]).toBe(0);
    });

    test("moves row backward (index 2 to 0) with three rows", () => {
      expect.hasAssertions();

      const threeRowDs = createDataSource(
        [createColumn("")],
        [createRow({ "": 0 }), createRow({ "": 1 }), createRow({ "": 2 })],
      );
      const { editedItem, operations } = setupWithDataSource(threeRowDs);
      const { reorderRows } = operations;
      const rows = editedItem.value?.dataSource?.rows ?? [];
      const newRows = [takeOne(rows, 2), takeOne(rows, 0), takeOne(rows, 1)] as Row[];
      reorderRows(newRows);
      const dataSource = editedItem.value?.dataSource;

      expectToBeDefined(dataSource);

      expect(takeOne(dataSource.rows, 0).data[""]).toBe(2);
      expect(takeOne(dataSource.rows, 1).data[""]).toBe(0);
      expect(takeOne(dataSource.rows, 2).data[""]).toBe(1);
    });

    test("no-op when order unchanged", () => {
      expect.hasAssertions();

      const { editedItem, operations } = setupWithDataSource();
      const { isUndoable, reorderRows } = operations;
      const rows = editedItem.value?.dataSource?.rows ?? [];
      reorderRows([...rows]);

      expect(isUndoable.value).toBe(false);
    });

    test("no-op when editedItem is undefined", () => {
      expect.hasAssertions();

      const { isUndoable, reorderRows } = useEditedItemDataSourceOperations();
      reorderRows([]);

      expect(isUndoable.value).toBe(false);
    });

    test("no-op when dataSource is null", () => {
      expect.hasAssertions();

      setupEditedItem();
      const { isUndoable, reorderRows } = useEditedItemDataSourceOperations();
      reorderRows([]);

      expect(isUndoable.value).toBe(false);
    });
  });

  describe("isUndoable and isRedoable state transitions", () => {
    test("initially not undoable and not redoable", () => {
      expect.hasAssertions();

      setupWithDataSource();
      const { isRedoable, isUndoable } = useEditedItemDataSourceOperations();

      expect(isUndoable.value).toBe(false);
      expect(isRedoable.value).toBe(false);
    });

    test("becomes undoable after an operation", () => {
      expect.hasAssertions();

      const { operations } = setupWithDataSource();
      const { deleteRow, isRedoable, isUndoable } = operations;
      deleteRow(0);

      expect(isUndoable.value).toBe(true);
      expect(isRedoable.value).toBe(false);
    });

    test("becomes redoable after undo", () => {
      expect.hasAssertions();

      const { operations } = setupWithDataSource();
      const { deleteRow, isRedoable, isUndoable, undo } = operations;
      deleteRow(0);
      undo();

      expect(isUndoable.value).toBe(false);
      expect(isRedoable.value).toBe(true);
    });

    test("undo no-op when history is empty", () => {
      expect.hasAssertions();

      const { editedItem, operations } = setupWithDataSource();
      const { isUndoable, undo } = operations;
      const rowCountBefore = editedItem.value?.dataSource?.rows.length ?? 0;
      undo();
      const dataSource = editedItem.value?.dataSource;

      expectToBeDefined(dataSource);

      expect(dataSource.rows).toHaveLength(rowCountBefore);
      expect(isUndoable.value).toBe(false);
    });

    test("redo no-op when future is empty", () => {
      expect.hasAssertions();

      const { editedItem, operations } = setupWithDataSource();
      const { isRedoable, redo } = operations;
      const rowCountBefore = editedItem.value?.dataSource?.rows.length ?? 0;
      redo();
      const dataSource = editedItem.value?.dataSource;

      expectToBeDefined(dataSource);

      expect(dataSource.rows).toHaveLength(rowCountBefore);
      expect(isRedoable.value).toBe(false);
    });

    test("new operation after undo clears redo history", () => {
      expect.hasAssertions();

      const { operations } = setupWithDataSource();
      const { deleteRow, isRedoable, undo } = operations;
      deleteRow(0);
      undo();

      expect(isRedoable.value).toBe(true);

      deleteRow(0);

      expect(isRedoable.value).toBe(false);
    });
  });

  describe("undoDescription and redoDescription", () => {
    test("undoDescription is null when no history", () => {
      expect.hasAssertions();

      setupWithDataSource();
      const { undoDescription } = useEditedItemDataSourceOperations();

      expect(undoDescription.value).toBeNull();
    });

    test("undoDescription reflects last command", () => {
      expect.hasAssertions();

      const { operations } = setupWithDataSource();
      const { deleteRow, undoDescription } = operations;
      deleteRow(0);

      expectToBeDefined(undoDescription.value);

      expect(undoDescription.value).toContain("Delete");
    });

    test("redoDescription is null when no future", () => {
      expect.hasAssertions();

      setupWithDataSource();
      const { redoDescription } = useEditedItemDataSourceOperations();

      expect(redoDescription.value).toBeNull();
    });

    test("redoDescription reflects undone command", () => {
      expect.hasAssertions();

      const { operations } = setupWithDataSource();
      const { deleteRow, redoDescription, undo } = operations;
      deleteRow(0);
      undo();

      expectToBeDefined(redoDescription.value);

      expect(redoDescription.value).toContain("Delete");
    });
  });

  describe("history clears when editedItem.id changes", () => {
    test("history is cleared when editedItem changes to a different item", async () => {
      expect.hasAssertions();

      const tableEditorStore = useTableEditorStore<DataSourceItemTypeMap[keyof DataSourceItemTypeMap]>();
      const { editedItem } = storeToRefs(tableEditorStore);
      const itemStore = useItemStore();
      const { createItem } = itemStore;
      const item1 = new CsvDataSourceItem();
      const item2 = new CsvDataSourceItem();
      createItem(item1);
      createItem(item2);
      editedItem.value = item1;
      const operations = useEditedItemDataSourceOperations();
      const { deleteRow, isUndoable, setDataSource } = operations;
      setDataSource(createDataSource([createColumn("")], [createRow({ "": 0 }), createRow({ "": 1 })]));
      deleteRow(0);

      expect(isUndoable.value).toBe(true);

      editedItem.value = item2;
      await nextTick();

      expect(isUndoable.value).toBe(false);
    });
  });

  describe("multiple sequential operations", () => {
    test("multiple undo operations reverse in order", () => {
      expect.hasAssertions();

      const { editedItem, operations } = setupWithDataSource();
      const { deleteRow, undo } = operations;
      deleteRow(1);
      deleteRow(0);
      const dataSourceAfterDeletes = editedItem.value?.dataSource;

      expectToBeDefined(dataSourceAfterDeletes);

      expect(dataSourceAfterDeletes.rows).toHaveLength(0);

      undo();
      const dataSourceAfterUndo1 = editedItem.value?.dataSource;

      expectToBeDefined(dataSourceAfterUndo1);

      expect(dataSourceAfterUndo1.rows).toHaveLength(1);
      expect(takeOne(dataSourceAfterUndo1.rows, 0).data[""]).toBe(0);

      undo();
      const dataSourceAfterUndo2 = editedItem.value?.dataSource;

      expectToBeDefined(dataSourceAfterUndo2);

      expect(dataSourceAfterUndo2.rows).toHaveLength(2);
      expect(takeOne(dataSourceAfterUndo2.rows, 0).data[""]).toBe(0);
      expect(takeOne(dataSourceAfterUndo2.rows, 1).data[""]).toBe(2);
    });

    test("mixed operations undo/redo correctly", () => {
      expect.hasAssertions();

      const { editedItem, operations } = setupWithDataSource();
      const { deleteColumn, deleteRow, redo, undo } = operations;
      deleteRow(0);
      deleteColumn(" ");
      const dataSourceAfterOps = editedItem.value?.dataSource;

      expectToBeDefined(dataSourceAfterOps);

      expect(dataSourceAfterOps.rows).toHaveLength(1);
      expect(dataSourceAfterOps.columns).toHaveLength(1);

      undo();
      const dataSourceAfterUndo1 = editedItem.value?.dataSource;

      expectToBeDefined(dataSourceAfterUndo1);

      expect(dataSourceAfterUndo1.columns).toHaveLength(2);

      undo();
      const dataSourceAfterUndo2 = editedItem.value?.dataSource;

      expectToBeDefined(dataSourceAfterUndo2);

      expect(dataSourceAfterUndo2.rows).toHaveLength(2);

      redo();
      const dataSourceAfterRedo1 = editedItem.value?.dataSource;

      expectToBeDefined(dataSourceAfterRedo1);

      expect(dataSourceAfterRedo1.rows).toHaveLength(1);

      redo();
      const dataSourceAfterRedo2 = editedItem.value?.dataSource;

      expectToBeDefined(dataSourceAfterRedo2);

      expect(dataSourceAfterRedo2.columns).toHaveLength(1);
    });
  });
});
