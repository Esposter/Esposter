import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

import { getCellTextRows } from "@/services/resource/sheet/commands/getCellTextRows";

const sanitizeTsvField = (value: string) => value.replaceAll(/[\t\r\n]/gu, " ");

export const serializeToTsv = (
  dataSource: DataSource,
  isIncludingHeaders = true,
  cellTextRows = getCellTextRows(dataSource.columns, dataSource.rows),
) => {
  const headerRow = dataSource.columns.map((column) => sanitizeTsvField(column.name)).join("\t");
  const dataRows = cellTextRows.map((cellTexts) => cellTexts.map((cellText) => sanitizeTsvField(cellText)).join("\t"));
  return isIncludingHeaders ? [headerRow, ...dataRows].join("\n") : dataRows.join("\n");
};
