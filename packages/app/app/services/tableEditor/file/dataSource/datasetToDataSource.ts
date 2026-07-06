import type { Dataset } from "#shared/models/dataset/Dataset";
import type { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";

import { BooleanColumn } from "#shared/models/tableEditor/file/column/BooleanColumn";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { DateColumn } from "#shared/models/tableEditor/file/column/DateColumn";
import { NumberColumn } from "#shared/models/tableEditor/file/column/NumberColumn";
import { StringColumn } from "#shared/models/tableEditor/file/column/StringColumn";
import { Row } from "#shared/models/tableEditor/file/datasource/Row";
import { inferDateFormat } from "@/services/tableEditor/file/column/inferDateFormat";
import { exhaustiveGuard, takeOne } from "@esposter/shared";

export const datasetToDataSource = (
  dataset: Dataset,
  datasetProviderType: DatasetProviderType,
  name: string,
): DataSource => {
  const columns = dataset.columns.map(({ name: sourceName, type }) => {
    switch (type) {
      case ColumnType.Boolean:
        return new BooleanColumn({ name: sourceName, sourceName });
      case ColumnType.Date: {
        const values = dataset.rows.map((row) => String(takeOne(row, sourceName) ?? ""));
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
  const size = columns.reduce((total, column) => total + column.size, 0);
  return {
    columns,
    metadata: { dataSourceType: datasetProviderType, importedAt: new Date(), name, size },
    rows,
    statistics: { columnCount: columns.length, rowCount: rows.length, size },
  };
};
