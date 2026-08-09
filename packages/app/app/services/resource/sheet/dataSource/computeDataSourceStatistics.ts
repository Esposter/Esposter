import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { DataSourceStatistics } from "@/models/resource/sheet/dataSource/DataSourceStatistics";

export const computeDataSourceStatistics = ({ columns, rows }: DataSource): DataSourceStatistics => ({
  columnCount: columns.length,
  rowCount: rows.length,
  size: columns.reduce((total, column) => total + column.size, 0),
});
