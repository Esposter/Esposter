import type { CsvDataSourceItem } from "#shared/models/tableEditor/file/csv/CsvDataSourceItem";
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

import { takeOne } from "@esposter/shared";

const escapeCell = (value: string, delimiter: string): string => {
  if (value.includes(delimiter) || value.includes('"') || value.includes("\n"))
    return `"${value.replaceAll('"', '""')}"`;
  return value;
};

export const serializeCsv = (dataSource: DataSource, item: CsvDataSourceItem, mimeType: string): Promise<Blob> => {
  const { delimiter } = item.configuration;
  const headerRow = dataSource.columns.map((column) => escapeCell(column.name, delimiter)).join(delimiter);
  const dataRows = dataSource.rows.map((row) =>
    dataSource.columns.map((column) => escapeCell(String(takeOne(row.data, column.name)), delimiter)).join(delimiter),
  );
  return Promise.resolve(new Blob([[headerRow, ...dataRows].join("\n")], { type: mimeType }));
};
