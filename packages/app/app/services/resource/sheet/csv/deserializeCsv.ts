import type { CsvFileSettings } from "#shared/models/resource/sheet/CsvFileSettings";
import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

import { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";
import { splitNonEmptyLines } from "@/services/resource/sheet/commands/splitNonEmptyLines";
import { deserializeCsvLine } from "@/services/resource/sheet/csv/deserializeCsvLine";
import { deserializeToDataSource } from "@/services/resource/sheet/dataSource/deserializeToDataSource";
import { getSourceColumnName } from "@/services/resource/sheet/dataSource/getSourceColumnName";

export const deserializeCsv = async (file: File, settings: CsvFileSettings): Promise<DataSource> => {
  const text = await file.text();
  const { delimiter } = settings.configuration;
  const [headerLine, ...bodyLines] = splitNonEmptyLines(text);
  const sourceNames = headerLine ? deserializeCsvLine(headerLine, delimiter).map(getSourceColumnName) : [];
  const bodyRows = bodyLines.map((line) => deserializeCsvLine(line, delimiter));
  return deserializeToDataSource(sourceNames, bodyRows, DataSourceType.Csv, file);
};
