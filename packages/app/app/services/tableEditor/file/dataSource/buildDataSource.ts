import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";
import type { DataSourceType } from "#shared/models/tableEditor/file/datasource/DataSourceType";

import { BooleanColumn } from "#shared/models/tableEditor/file/column/BooleanColumn";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { DateColumn } from "#shared/models/tableEditor/file/column/DateColumn";
import { NumberColumn } from "#shared/models/tableEditor/file/column/NumberColumn";
import { StringColumn } from "#shared/models/tableEditor/file/column/StringColumn";
import { Row } from "#shared/models/tableEditor/file/datasource/Row";
import { coerceValue } from "@/services/tableEditor/file/column/coerceValue";
import { inferColumnType } from "@/services/tableEditor/file/column/inferColumnType";
import { inferDateFormat } from "@/services/tableEditor/file/column/inferDateFormat";
import { takeOne } from "@esposter/shared";

export const buildDataSource = (
  file: File,
  dataSourceType: DataSourceType,
  sourceNames: string[],
  bodyRows: string[][],
): DataSource => {
  const columns = sourceNames.map((sourceName, index) => {
    const values = bodyRows.map((row) => takeOne(row, index));
    const type = inferColumnType(values);
    switch (type) {
      case ColumnType.Date:
        return new DateColumn({ format: inferDateFormat(values), name: sourceName, sourceName });
      case ColumnType.Boolean:
        return new BooleanColumn({ name: sourceName, sourceName });
      case ColumnType.Number:
        return new NumberColumn({ name: sourceName, sourceName });
      default:
        return new StringColumn({ name: sourceName, sourceName });
    }
  });
  const rows = bodyRows.map((bodyRow) => {
    const row = new Row();
    row.data = Object.fromEntries(
      columns.map((column, index) => [column.name, coerceValue(takeOne(bodyRow, index), column.type)]),
    );
    return row;
  });
  for (const column of columns)
    column.size = rows.reduce((total, row) => total + JSON.stringify(takeOne(row.data, column.name)).length, 0);
  return {
    columns,
    metadata: { dataSourceType, importedAt: new Date(), name: file.name, size: file.size },
    rows,
    stats: {
      columnCount: columns.length,
      rowCount: rows.length,
      size: columns.reduce((total, column) => total + column.size, 0),
    },
  };
};
