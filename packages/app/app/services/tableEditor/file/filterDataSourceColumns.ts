import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

export const filterDataSourceColumns = (dataSource: DataSource, columnNames: string[]): DataSource => {
  const columnNameSet = new Set(columnNames);
  const columns = dataSource.columns.filter((column) => columnNameSet.has(column.name));
  const rows = dataSource.rows.map((row) =>
    Object.fromEntries(columns.map((column) => [column.name, row[column.name] ?? null])),
  );
  return { ...dataSource, columns, rows };
};
