import type { ColumnItem } from "#shared/models/tableEditor/file/ColumnItem";
import type { Metadata } from "#shared/models/tableEditor/file/Metadata";

export interface DataSource {
  columns: ColumnItem[];
  metadata: Metadata;
  rows: Record<string, boolean | null | number | string>[];
}
