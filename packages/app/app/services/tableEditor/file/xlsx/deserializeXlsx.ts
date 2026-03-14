import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { XlsxDataSourceItem } from "#shared/models/tableEditor/file/xlsx/XlsxDataSourceItem";

import { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";
import { buildDataSource } from "@/services/tableEditor/file/buildDataSource";
import { takeOne } from "@esposter/shared";
import readXlsxFile from "read-excel-file/browser";

export const deserializeXlsx = async (file: File, item: XlsxDataSourceItem): Promise<DataSource> => {
  const rawData = await readXlsxFile(file, { sheet: item.configuration.sheetIndex + 1 });
  if (rawData.length === 0) return buildDataSource(file, DataSourceType.Xlsx, [], []);
  const sourceNames = takeOne(rawData).map((cell, index) => cell?.toString().trim() ?? `Column ${index + 1}`);
  const bodyRows = rawData.slice(1).map((row) => row.map((cell) => cell?.toString() ?? ""));
  return buildDataSource(file, DataSourceType.Xlsx, sourceNames, bodyRows);
};
