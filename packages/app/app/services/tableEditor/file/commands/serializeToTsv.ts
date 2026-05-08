import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";

const sanitizeTsvField = (value: string): string => value.replaceAll(new RegExp(String.raw`[\t\r\n]`, "gu"), " ");

export const serializeToTsv = (dataSource: DataSource): string => {
  const headerRow = dataSource.columns.map((column) => sanitizeTsvField(column.name)).join("\t");
  const dataRows = dataSource.rows.map((row) =>
    dataSource.columns.map((column) => sanitizeTsvField(String(row.data[column.name] ?? ""))).join("\t"),
  );
  return [headerRow, ...dataRows].join("\n");
};
