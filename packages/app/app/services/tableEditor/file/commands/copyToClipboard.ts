import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

import { takeOne } from "@esposter/shared";

const escapeCell = (value: string): string => {
  if (value.includes("\t") || value.includes('"') || value.includes("\n"))
    return `"${value.replaceAll('"', '""')}"`;
  return value;
};

export const copyToClipboard = (dataSource: DataSource, rowIds?: string[]): Promise<void> => {
  const visibleColumns = dataSource.columns.filter((column) => !column.hidden);
  const rows = rowIds ? dataSource.rows.filter((row) => rowIds.includes(row.id)) : dataSource.rows;
  const headerRow = visibleColumns.map((column) => escapeCell(column.name)).join("\t");
  const dataRows = rows.map((row) =>
    visibleColumns
      .map((column) => {
        const value = takeOne(row.data, column.name);
        return escapeCell(value === null ? "" : String(value));
      })
      .join("\t"),
  );
  return navigator.clipboard.writeText([headerRow, ...dataRows].join("\n"));
};
