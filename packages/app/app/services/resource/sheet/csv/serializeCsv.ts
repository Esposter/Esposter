import type { MimeType } from "#shared/models/file/MimeType";
import type { CsvFileSettings } from "#shared/models/resource/sheet/CsvFileSettings";
import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

import { escapeCsvCell } from "@/services/resource/sheet/csv/escapeCsvCell";
import { takeOne } from "@esposter/shared";

export const serializeCsv = (dataSource: DataSource, settings: CsvFileSettings, mimeType: MimeType): Promise<Blob> => {
  const { delimiter } = settings.configuration;
  const headerRow = dataSource.columns.map((column) => escapeCsvCell(column.name, delimiter)).join(delimiter);
  const dataRows = dataSource.rows.map((row) =>
    dataSource.columns
      .map((column) => escapeCsvCell(String(takeOne(row.data, column.name)), delimiter))
      .join(delimiter),
  );
  return Promise.resolve(new Blob([[headerRow, ...dataRows].join("\n")], { type: mimeType }));
};
