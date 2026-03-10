import type { CsvDataSourceItem } from "#shared/models/tableEditor/file/csv/CsvDataSourceItem";
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

const escapeCell = (value: string, delimiter: string): string => {
  if (value.includes(delimiter) || value.includes('"') || value.includes("\n"))
    return `"${value.replace(/"/g, '""')}"`;
  return value;
};

export const serializeCsv = async (dataSource: DataSource, item: CsvDataSourceItem): Promise<Blob> => {
  const { delimiter } = item.configuration;
  const headerRow = dataSource.columns.map((column) => escapeCell(column.name, delimiter)).join(delimiter);
  const dataRows = dataSource.rows.map((row) =>
    dataSource.columns.map((column) => escapeCell(String(row[column.name] ?? ""), delimiter)).join(delimiter),
  );
  return new Blob([[headerRow, ...dataRows].join("\n")], { type: "text/csv" });
};
