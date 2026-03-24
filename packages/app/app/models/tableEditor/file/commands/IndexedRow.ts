import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";

export interface IndexedRow {
  index: number;
  row: DataSource["rows"][number];
}
