import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

export const syncStats = (dataSource: DataSource) => {
  dataSource.stats.columnCount = dataSource.columns.length;
  dataSource.stats.rowCount = dataSource.rows.length;
  dataSource.stats.size = dataSource.columns.reduce((total, column) => total + column.size, 0);
};
