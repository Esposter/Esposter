import type { AColumn } from "#shared/models/tableEditor/file/AColumn";
import type { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import type { ColumnValue } from "#shared/models/tableEditor/file/ColumnValue";
import type { Metadata } from "#shared/models/tableEditor/file/Metadata";

export interface DataSource {
  columns: AColumn<ColumnType>[];
  metadata: Metadata;
  rows: Record<string, ColumnValue>[];
}
