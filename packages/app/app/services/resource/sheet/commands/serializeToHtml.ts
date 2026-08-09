import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

import { getCellTextRows } from "@/services/resource/sheet/commands/getCellTextRows";
import { escapeHtml } from "@/util/text/escapeHtml";

export const serializeToHtml = (
  dataSource: DataSource,
  includeHeaders = true,
  cellTextRows = getCellTextRows(dataSource.columns, dataSource.rows),
): string => {
  const headerCells = dataSource.columns.map((column) => `<th>${escapeHtml(column.name)}</th>`).join("");
  const dataRows = cellTextRows
    .map((cellTexts) => `<tr>${cellTexts.map((cellText) => `<td>${escapeHtml(cellText)}</td>`).join("")}</tr>`)
    .join("");
  const header = includeHeaders ? `<tr>${headerCells}</tr>` : "";
  return `<table>${header}${dataRows}</table>`;
};
