import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

export const syncStatistics = (dataSource: DataSource) => {
  dataSource.statistics.columnCount = dataSource.columns.length;
  dataSource.statistics.rowCount = dataSource.rows.length;
  dataSource.statistics.size = dataSource.columns.reduce((total, column) => total + column.size, 0);
};
