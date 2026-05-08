import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";

export const serializeToTsv = (dataSource: DataSource): string => {
  const headerRow = dataSource.columns.map((column) => column.name.replaceAll("\t", " ")).join("\t");
  const dataRows = dataSource.rows.map((row) =>
    dataSource.columns.map((column) => String(row.data[column.name] ?? "").replaceAll("\t", " ")).join("\t"),
  );
  return [headerRow, ...dataRows].join("\n");
};
