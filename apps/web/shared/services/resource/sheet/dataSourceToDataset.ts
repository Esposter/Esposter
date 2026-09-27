import type { Dataset } from "#shared/models/dataset/Dataset";
import type { DatasetColumn } from "#shared/models/dataset/DatasetColumn";
import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { ToData } from "@esposter/shared";

import { computeValue } from "#shared/services/resource/sheet/column/computeValue";
import { getEffectiveColumnType } from "#shared/services/resource/sheet/column/getEffectiveColumnType";

// A computed column is served as the type its transformation yields, valued by the compute the grid runs. Only the
// First `rowLimit` rows are served, but every row is the compute's context, so an aggregation reads the whole sheet
export const dataSourceToDataset = ({ columns, rows }: ToData<DataSource>, rowLimit = rows.length): Dataset => {
  const datasetColumns: DatasetColumn[] = columns.map((column) => ({
    name: column.name,
    type: getEffectiveColumnType(column),
  }));
  return {
    columns: datasetColumns,
    rows: rows
      .slice(0, rowLimit)
      .map((row, rowIndex) =>
        Object.fromEntries(
          columns.map((column) => [column.name, computeValue(rows, row, columns, column, rowIndex) ?? null]),
        ),
      ),
  };
};
