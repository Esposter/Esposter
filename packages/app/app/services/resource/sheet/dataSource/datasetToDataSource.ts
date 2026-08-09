import type { Dataset } from "#shared/models/dataset/Dataset";
import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { Metadata } from "#shared/models/resource/sheet/datasource/Metadata";

import { BooleanColumn } from "#shared/models/resource/sheet/column/BooleanColumn";
import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { DateColumn } from "#shared/models/resource/sheet/column/DateColumn";
import { NumberColumn } from "#shared/models/resource/sheet/column/NumberColumn";
import { StringColumn } from "#shared/models/resource/sheet/column/StringColumn";
import { Row } from "#shared/models/resource/sheet/datasource/Row";
import { inferDateFormat } from "@/services/resource/sheet/column/inferDateFormat";
import { getValueSize } from "@/services/resource/sheet/commands/getValueSize";
import { syncStatistics } from "@/services/resource/sheet/commands/syncStatistics";
import { exhaustiveGuard } from "@esposter/shared";

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
    column.size = rows.reduce((total, row) => total + getValueSize(row.data[column.name]), 0);

  const dataSource: DataSource = {
    columns,
    metadata: { dataSourceType, importedAt: new Date(), name, size: 0 },
    rows,
    statistics: { columnCount: 0, rowCount: 0, size: 0 },
  };
  syncStatistics(dataSource);
  dataSource.metadata.size = size ?? dataSource.statistics.size;
  return dataSource;
};
