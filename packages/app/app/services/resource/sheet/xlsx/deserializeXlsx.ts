import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { XlsxFileSettings } from "#shared/models/resource/sheet/XlsxFileSettings";

import { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";
import { deserializeToDataSource } from "@/services/resource/sheet/dataSource/deserializeToDataSource";
import { getSourceColumnName } from "@/services/resource/sheet/dataSource/getSourceColumnName";
import { readSheet } from "read-excel-file/browser";

export const deserializeXlsx = async (file: File, settings: XlsxFileSettings): Promise<DataSource> => {
  const rawData = await readSheet(file, settings.configuration.sheetIndex + 1);
  const [headerCells, ...bodyCells] = rawData;
  const sourceNames = headerCells
    ? headerCells.map((cell, index) => getSourceColumnName(cell?.toString() ?? "", index))
    : [];
  const bodyRows = bodyCells.map((row) => row.map((cell) => cell?.toString() ?? ""));
  return deserializeToDataSource(sourceNames, bodyRows, DataSourceType.Xlsx, file);
};
