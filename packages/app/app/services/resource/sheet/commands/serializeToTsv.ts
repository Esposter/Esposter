import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

import { getCellTextRows } from "@/services/resource/sheet/commands/getCellTextRows";

const sanitizeTsvField = (value: string): string => value.replaceAll(/[\t\r\n]/gu, " ");

export const serializeToTsv = (
  dataSource: DataSource,
  includeHeaders = true,
  cellTextRows = getCellTextRows(dataSource.columns, dataSource.rows),
): string => {
  const headerRow = dataSource.columns.map((column) => sanitizeTsvField(column.name)).join("\t");
  const dataRows = cellTextRows.map((cellTexts) => cellTexts.map(sanitizeTsvField).join("\t"));
  return includeHeaders ? [headerRow, ...dataRows].join("\n") : dataRows.join("\n");
};
