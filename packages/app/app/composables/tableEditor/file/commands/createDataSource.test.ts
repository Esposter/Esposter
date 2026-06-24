import type { Column } from "#shared/models/tableEditor/file/column/Column";
import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";
import type { Row } from "#shared/models/tableEditor/file/datasource/Row";

import { DataSourceType } from "#shared/models/tableEditor/file/datasource/DataSourceType";
import { describe } from "vitest";

export const createDataSource = (columns: Column[] = [], rows: Row[] = []): DataSource => ({
  columns,
  metadata: { dataSourceType: DataSourceType.Csv, importedAt: new Date(0), name: "", size: 0 },
  rows,
  statistics: { columnCount: columns.length, rowCount: rows.length, size: 0 },
});

describe.todo("createDataSource");
