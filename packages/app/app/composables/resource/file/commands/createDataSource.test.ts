import type { Column } from "#shared/models/resource/file/column/Column";
import type { DataSource } from "#shared/models/resource/file/datasource/DataSource";
import type { Row } from "#shared/models/resource/file/datasource/Row";

import { DataSourceType } from "#shared/models/resource/file/datasource/DataSourceType";
import { describe } from "vitest";

export const createDataSource = (columns: Column[] = [], rows: Row[] = []): DataSource => ({
  columns,
  metadata: { dataSourceType: DataSourceType.Csv, importedAt: new Date(0), name: "", size: 0 },
  rows,
  statistics: { columnCount: columns.length, rowCount: rows.length, size: 0 },
});

describe.todo("createDataSource");
