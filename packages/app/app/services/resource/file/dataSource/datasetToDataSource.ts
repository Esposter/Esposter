import type { Dataset } from "#shared/models/dataset/Dataset";
import type { DataSource } from "#shared/models/resource/file/datasource/DataSource";
import type { Metadata } from "#shared/models/resource/file/datasource/Metadata";

import { BooleanColumn } from "#shared/models/resource/file/column/BooleanColumn";
import { ColumnType } from "#shared/models/resource/file/column/ColumnType";
import { DateColumn } from "#shared/models/resource/file/column/DateColumn";
import { NumberColumn } from "#shared/models/resource/file/column/NumberColumn";
import { StringColumn } from "#shared/models/resource/file/column/StringColumn";
import { Row } from "#shared/models/resource/file/datasource/Row";
import { inferDateFormat } from "@/services/resource/file/column/inferDateFormat";
import { exhaustiveGuard, takeOne } from "@esposter/shared";

export const datasetToDataSource = (
  dataset: Dataset,
  dataSourceType: Metadata["dataSourceType"],
  name: string,
  size?: number,
): DataSource => {
  const columns = dataset.columns.map(({ name: sourceName, type }) => {
    switch (type) {
      case ColumnType.Boolean:
        return new BooleanColumn({ name: sourceName, sourceName });
      case ColumnType.Date: {
        const values = dataset.rows.map((row) => String(row[sourceName] ?? ""));
        return new DateColumn({ format: inferDateFormat(values), name: sourceName, sourceName });
      }
      case ColumnType.Number:
        return new NumberColumn({ name: sourceName, sourceName });
      case ColumnType.String:
        return new StringColumn({ name: sourceName, sourceName });
      default:
        return exhaustiveGuard(type);
    }
  });
  const rows = dataset.rows.map((data) => new Row({ data }));
  for (const column of columns)
    column.size = rows.reduce((total, row) => total + JSON.stringify(takeOne(row.data, column.name)).length, 0);
  const statisticsSize = columns.reduce((total, column) => total + column.size, 0);
  return {
    columns,
    metadata: { dataSourceType, importedAt: new Date(), name, size: size ?? statisticsSize },
    rows,
    statistics: { columnCount: columns.length, rowCount: rows.length, size: statisticsSize },
  };
};
