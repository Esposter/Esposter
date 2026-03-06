import type { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";

export interface Metadata {
  columnCount: number;
  dataSourceType: DataSourceType;
  importedAt: Date;
  name: string;
  rowCount: number;
  size?: number;
}
