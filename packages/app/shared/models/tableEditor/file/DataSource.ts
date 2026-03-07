import type { AColumn } from "#shared/models/tableEditor/file/AColumn";
import type { ColumnValue } from "#shared/models/tableEditor/file/ColumnValue";
import type { Metadata } from "#shared/models/tableEditor/file/Metadata";

export interface DataSource {
  columns: AColumn[];
  metadata: Metadata;
  rows: Record<string, ColumnValue>[];
}
