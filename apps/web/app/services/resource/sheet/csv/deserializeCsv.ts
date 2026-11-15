import type { CsvFileSettings } from "#shared/models/resource/sheet/CsvFileSettings";

import { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";
import { deserializeCsvLine } from "#src/services/resource/sheet/csv/deserializeCsvLine";
import { splitCsvRecords } from "#src/services/resource/sheet/csv/splitCsvRecords";
import { deserializeToDataSource } from "#src/services/resource/sheet/dataSource/deserializeToDataSource";
import { getSourceColumnName } from "#src/services/resource/sheet/dataSource/getSourceColumnName";

export const deserializeCsv = async (file: File, settings: CsvFileSettings) => {
  const text = await file.text();
  const { delimiter } = settings.configuration;
  const [headerLine, ...bodyLines] = splitCsvRecords(text);
  const sourceNames = headerLine
    ? deserializeCsvLine(headerLine, delimiter).map((field, index) => getSourceColumnName(field, index))
    : [];
  const bodyRows = bodyLines.map((line) => deserializeCsvLine(line, delimiter));
  return deserializeToDataSource(sourceNames, bodyRows, DataSourceType.Csv, file);
};
