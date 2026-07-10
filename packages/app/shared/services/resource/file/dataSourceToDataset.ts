import type { Dataset } from "#shared/models/dataset/Dataset";
import type { DatasetColumn } from "#shared/models/dataset/DatasetColumn";
import type { DataSource } from "#shared/models/resource/file/datasource/DataSource";
import type { ToData } from "@esposter/shared";

import { ColumnType } from "#shared/models/resource/file/column/ColumnType";

// Computed columns are excluded: their values are derived at render time by the table editor
export const dataSourceToDataset = ({ columns, rows }: ToData<DataSource>): Dataset => {
  const datasetColumns: DatasetColumn[] = [];
  for (const { name, type } of columns) if (type !== ColumnType.Computed) datasetColumns.push({ name, type });
  return {
    columns: datasetColumns,
    rows: rows.map((row) => Object.fromEntries(datasetColumns.map(({ name }) => [name, row.data[name] ?? null]))),
  };
};
