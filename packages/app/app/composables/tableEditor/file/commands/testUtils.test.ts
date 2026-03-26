import type { ColumnTransformation } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformation";
import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";
import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/datasource/DataSourceItemTypeMap";

import { BooleanColumn } from "#shared/models/tableEditor/file/column/BooleanColumn";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { ComputedColumn } from "#shared/models/tableEditor/file/column/ComputedColumn";
import { DateColumn } from "#shared/models/tableEditor/file/column/DateColumn";
import { NumberColumn } from "#shared/models/tableEditor/file/column/NumberColumn";
import { StringColumn } from "#shared/models/tableEditor/file/column/StringColumn";
import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { CsvDataSourceItem } from "#shared/models/tableEditor/file/csv/CsvDataSourceItem";
import { DataSourceType } from "#shared/models/tableEditor/file/datasource/DataSourceType";
import { Row } from "#shared/models/tableEditor/file/datasource/Row";
import { useTableEditorStore } from "@/store/tableEditor";
import { useItemStore } from "@/store/tableEditor/item";
import { describe } from "vitest";

export const makeDataSource = (columns: DataSource["columns"] = [], rows: Row[] = []): DataSource => ({
  columns,
  metadata: { dataSourceType: DataSourceType.Csv, importedAt: new Date(0), name: "", size: 0 },
  rows,
  stats: { columnCount: columns.length, rowCount: rows.length, size: 0 },
});

export const makeColumn = (name: string): StringColumn => new StringColumn({ name, size: 0, sourceName: name });

export const makeNumberColumn = (name: string): NumberColumn => new NumberColumn({ name, size: 0, sourceName: name });

export const makeBooleanColumn = (name: string): BooleanColumn =>
  new BooleanColumn({ name, size: 0, sourceName: name });

export const makeDateColumn = (name: string, format: DateColumn["format"]): DateColumn =>
  new DateColumn({ format, name, size: 0, sourceName: name });

export const makeComputedColumn = (
  name: string,
  sourceColumnId: string,
  transformation: ColumnTransformation = {
    sourceColumnId,
    targetType: ColumnType.String,
    type: ColumnTransformationType.ConvertTo,
  },
): ComputedColumn => new ComputedColumn({ name, size: 0, sourceName: name, transformation });

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
