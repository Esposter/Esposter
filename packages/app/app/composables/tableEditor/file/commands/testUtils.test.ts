import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";

import { Column } from "#shared/models/tableEditor/file/Column";
import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { CsvDataSourceItem } from "#shared/models/tableEditor/file/csv/CsvDataSourceItem";
import { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";
import { DateColumn } from "#shared/models/tableEditor/file/DateColumn";
import { Row } from "#shared/models/tableEditor/file/Row";
import { useTableEditorStore } from "@/store/tableEditor";
import { useItemStore } from "@/store/tableEditor/item";
import { describe } from "vitest";

export const makeDataSource = (columns: DataSource["columns"] = [], rows: Row[] = []): DataSource => ({
  columns,
  metadata: { dataSourceType: DataSourceType.Csv, importedAt: new Date(0), name: "", size: 0 },
  rows,
  stats: { columnCount: columns.length, rowCount: rows.length, size: 0 },
});

export const makeColumn = (name: string): Column => new Column({ name, size: 0, sourceName: name });

export const makeNumberColumn = (name: string): Column<ColumnType.Number> =>
  new Column({ name, size: 0, sourceName: name, type: ColumnType.Number });

export const makeDateColumn = (name: string, format: DateColumn["format"]): DateColumn =>
  new DateColumn({ format, name, size: 0, sourceName: name });

export const makeRow = (data: Record<string, boolean | null | number | string>): Row => new Row({ data });

export const setupEditedItem = () => {
  const tableEditorStore = useTableEditorStore<DataSourceItemTypeMap[keyof DataSourceItemTypeMap]>();
  const { editedItem } = storeToRefs(tableEditorStore);
  const itemStore = useItemStore();
  const { createItem } = itemStore;
  const item = new CsvDataSourceItem();
  createItem(item);
  editedItem.value = item;
  return { editedItem, item };
};

export const setupWithDataSource = (dataSource?: DataSource) => {
  const { editedItem, item } = setupEditedItem();
  const ds =
    dataSource ??
    makeDataSource([makeColumn(""), makeColumn(" ")], [makeRow({ "": 0, " ": 1 }), makeRow({ "": 2, " ": 3 })]);
  const setDataSource = useSetDataSource();
  setDataSource(ds);
  return { editedItem, item };
};

describe.todo("testUtils");
