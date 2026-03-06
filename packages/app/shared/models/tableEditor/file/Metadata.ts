import type { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";

export interface Metadata {
  dataSourceType: DataSourceType;
  name: string;
  columnCount: number;
  rowCount: number;
  importedAt: Date;
  size?: number;
}
