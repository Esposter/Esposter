import type { Column } from "#shared/models/tableEditor/file/column/Column";
import type { ColumnTransformation } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformation";
import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";
import type { DataSourceItem } from "#shared/models/tableEditor/file/datasource/DataSourceItem";

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

export const createDataSource = (columns: Column[] = [], rows: Row[] = []): DataSource => ({
  columns,
  metadata: { dataSourceType: DataSourceType.Csv, importedAt: new Date(0), name: "", size: 0 },
  rows,
  statistics: { columnCount: columns.length, rowCount: rows.length, size: 0 },
});

export const createColumn = (name: string): StringColumn => new StringColumn({ name, size: 0, sourceName: name });

export const createNumberColumn = (name: string): NumberColumn => new NumberColumn({ name, size: 0, sourceName: name });

export const createBooleanColumn = (name: string): BooleanColumn =>
  new BooleanColumn({ name, size: 0, sourceName: name });

export const createDateColumn = (name: string, format: DateColumn["format"]): DateColumn =>
  new DateColumn({ format, name, size: 0, sourceName: name });

export const createComputedColumn = (
  name: string,
  sourceColumnId: string,
  transformation: ColumnTransformation = {
    sourceColumnId,
    targetType: ColumnType.String,
    type: ColumnTransformationType.ConvertTo,
  },
): ComputedColumn => new ComputedColumn({ name, size: 0, sourceName: name, transformation });

export const createRow = (data: Record<string, boolean | null | number | string>): Row => new Row({ data });

export const setupEditedItem = () => {
  const tableEditorStore = useTableEditorStore<DataSourceItem>();
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
    createDataSource(
      [createColumn(""), createColumn(" ")],
      [createRow({ "": 0, " ": 1 }), createRow({ "": 2, " ": 3 })],
    );
  const setDataSource = useSetDataSource();
  setDataSource(ds);
  return { editedItem, item };
};

describe.todo("testUtils");
