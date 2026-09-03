import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { XlsxFileSettings } from "#shared/models/resource/sheet/XlsxFileSettings";

import { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";
import { deserializeToDataSource } from "@/services/resource/sheet/dataSource/deserializeToDataSource";
import { getSourceColumnName } from "@/services/resource/sheet/dataSource/getSourceColumnName";

export const deserializeXlsx = async (file: File, settings: XlsxFileSettings): Promise<DataSource> => {
  // The command bar renders on every resource page and reaches this codec through PortableFormatMap, while
  // Xlsx is one format of the one portable type that has it — the eight types that can neither import nor
  // Export would otherwise ship a workbook parser they can never run, so it is fetched when one is read
  const { readSheet } = await import("read-excel-file/browser");
  const cellRows = await readSheet(file, settings.configuration.sheetIndex + 1);
  const [headerCells, ...bodyCells] = cellRows;
  const sourceNames = headerCells
    ? headerCells.map((cell, index) => getSourceColumnName(cell?.toString() ?? "", index))
    : [];
  const bodyRows = bodyCells.map((row) => row.map((cell) => cell?.toString() ?? ""));
  return deserializeToDataSource(sourceNames, bodyRows, DataSourceType.Xlsx, file);
};
