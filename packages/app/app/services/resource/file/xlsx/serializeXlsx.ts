import type { MimeType } from "#shared/models/file/MimeType";
import type { DataSource } from "#shared/models/resource/file/datasource/DataSource";
import type { XlsxFileSettings } from "#shared/models/resource/file/XlsxFileSettings";

import { takeOne } from "@esposter/shared";
import writeXlsxFile from "write-excel-file/browser";

export const serializeXlsx = (
  dataSource: DataSource,
  _settings: XlsxFileSettings,
  _mimeType: MimeType,
): Promise<Blob> => {
  const headerRow = dataSource.columns.map((column) => column.name);
  const dataRows = dataSource.rows.map((row) => dataSource.columns.map((column) => takeOne(row.data, column.name)));
  return writeXlsxFile([headerRow, ...dataRows]).toBlob();
};
