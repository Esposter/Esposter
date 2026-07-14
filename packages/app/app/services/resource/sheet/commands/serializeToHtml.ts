import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

import { escapeHtml } from "@/util/text/escapeHtml";

export const serializeToHtml = (dataSource: DataSource, includeHeaders = true): string => {
  const headerCells = dataSource.columns.map((column) => `<th>${escapeHtml(column.name)}</th>`).join("");
  const dataRows = dataSource.rows
    .map((row) => {
      const cells = dataSource.columns
        .map((column) => `<td>${escapeHtml(String(row.data[column.name] ?? ""))}</td>`)
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");
  const header = includeHeaders ? `<tr>${headerCells}</tr>` : "";
  return `<table>${header}${dataRows}</table>`;
};
