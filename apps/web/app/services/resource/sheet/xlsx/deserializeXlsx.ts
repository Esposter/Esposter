import type { XlsxFileSettings } from "#shared/models/resource/sheet/XlsxFileSettings";

import { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";
import { deserializeToDataSource } from "@/services/resource/sheet/dataSource/deserializeToDataSource";
import { getSourceColumnName } from "@/services/resource/sheet/dataSource/getSourceColumnName";

export const deserializeXlsx = async (file: File, settings: XlsxFileSettings) => {
  // eslint-disable-next-line no-restricted-syntax -- the command bar reaches this codec on every resource page, so the workbook parser is fetched only when an xlsx is read
  const { readSheet } = await import("read-excel-file/browser");
  const cellRows = await readSheet(file, settings.configuration.sheetIndex + 1);
  const [headerCells, ...bodyCells] = cellRows;
  const sourceNames = headerCells
    ? headerCells.map((cell, index) => getSourceColumnName(cell?.toString() ?? "", index))
    : [];
  const bodyRows = bodyCells.map((row) => row.map((cell) => cell?.toString() ?? ""));
  return deserializeToDataSource(sourceNames, bodyRows, DataSourceType.Xlsx, file);
};
