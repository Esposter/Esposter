import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { XlsxFileSettings } from "#shared/models/resource/sheet/XlsxFileSettings";

import { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";
import { buildDataset } from "@/services/resource/sheet/dataSource/buildDataset";
import { datasetToDataSource } from "@/services/resource/sheet/dataSource/datasetToDataSource";
import { normalizeString, takeOne } from "@esposter/shared";
import { readSheet } from "read-excel-file/browser";

export const deserializeXlsx = async (file: File, settings: XlsxFileSettings): Promise<DataSource> => {
  const rawData = await readSheet(file, settings.configuration.sheetIndex + 1);
  if (rawData.length === 0) return datasetToDataSource(buildDataset([], []), DataSourceType.Xlsx, file.name, file.size);
  const sourceNames = takeOne(rawData).map((cell, index) => normalizeString(cell?.toString()) || `Column ${index + 1}`);
  const bodyRows = rawData.slice(1).map((row) => row.map((cell) => cell?.toString() ?? ""));
  return datasetToDataSource(buildDataset(sourceNames, bodyRows), DataSourceType.Xlsx, file.name, file.size);
};
