import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

export const filterDataSourceColumns = (dataSource: DataSource, columnIds: string[]): DataSource => {
  const columns = dataSource.columns.filter((column) => columnIds.includes(column.id));
  const rows = dataSource.rows.map((row) =>
    Object.fromEntries(columns.map((column) => [column.name, row[column.name] ?? null])),
  );
  return { ...dataSource, columns, rows };
};
