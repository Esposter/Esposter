import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { Row } from "#shared/models/resource/sheet/datasource/Row";

import { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";
import { describe } from "vitest";

export const createDataSource = (columns: Column[] = [], rows: Row[] = []): DataSource => ({
  columns,
  metadata: { dataSourceType: DataSourceType.Csv, importedAt: new Date(0), name: "", size: 0 },
  rows,
});

describe.todo("createDataSource");
