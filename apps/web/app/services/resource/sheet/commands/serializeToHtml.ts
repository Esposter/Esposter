import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

import { escapeHtml } from "#shared/util/text/escapeHtml";
import { getCellTextRows } from "#src/services/resource/sheet/commands/getCellTextRows";
import { neutralizeFormula } from "#src/services/resource/sheet/commands/neutralizeFormula";

export const serializeToHtml = (
  dataSource: DataSource,
  isIncludingHeaders = true,
  cellTextRows = getCellTextRows(dataSource.columns, dataSource.rows),
) => {
  // A spreadsheet reads the table's cells as it reads the text, so the same formula prefix applies
  const headerCells = dataSource.columns
    .map((column) => `<th>${escapeHtml(neutralizeFormula(column.name))}</th>`)
    .join("");
  const dataRows = cellTextRows
    .map(
      (cellTexts) =>
        `<tr>${cellTexts.map((cellText) => `<td>${escapeHtml(neutralizeFormula(cellText))}</td>`).join("")}</tr>`,
    )
    .join("");
  const header = isIncludingHeaders ? `<tr>${headerCells}</tr>` : "";
  return `<table>${header}${dataRows}</table>`;
};
