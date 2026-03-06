import type { ColumnItem } from "#shared/models/tableEditor/file/ColumnItem";
import type { ColumnValue } from "#shared/models/tableEditor/file/ColumnValue";
import type { Metadata } from "#shared/models/tableEditor/file/Metadata";

export interface DataSource {
  columns: ColumnItem[];
  metadata: Metadata;
  rows: Record<string, ColumnValue>[];
}
