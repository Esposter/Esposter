import type { Column } from "#shared/models/tableEditor/file/Column";
import type { ColumnValue } from "#shared/models/tableEditor/file/ColumnValue";
import type { Metadata } from "#shared/models/tableEditor/file/Metadata";

export interface DataSource {
  columns: Column[];
  metadata: Metadata;
  rows: Record<string, ColumnValue>[];
}
