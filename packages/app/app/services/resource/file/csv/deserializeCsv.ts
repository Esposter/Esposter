import type { CsvFileSettings } from "#shared/models/resource/file/CsvFileSettings";
import type { DataSource } from "#shared/models/resource/file/datasource/DataSource";

import { DataSourceType } from "#shared/models/resource/file/datasource/DataSourceType";
import { deserializeCsvLine } from "@/services/resource/file/csv/deserializeCsvLine";
import { buildDataset } from "@/services/resource/file/dataSource/buildDataset";
import { datasetToDataSource } from "@/services/resource/file/dataSource/datasetToDataSource";
import { normalizeString, takeOne } from "@esposter/shared";

export const deserializeCsv = async (file: File, settings: CsvFileSettings): Promise<DataSource> => {
  const text = await file.text();
  const lines = text.split(/\r?\n/u).filter((line) => normalizeString(line) !== "");
  if (lines.length === 0) return datasetToDataSource(buildDataset([], []), DataSourceType.Csv, file.name, file.size);
  const sourceNames = deserializeCsvLine(takeOne(lines), settings.configuration.delimiter).map(
    (sourceName, index) => normalizeString(sourceName) || `Column ${index + 1}`,
  );
  const bodyRows = lines.slice(1).map((line) => deserializeCsvLine(line, settings.configuration.delimiter));
  return datasetToDataSource(buildDataset(sourceNames, bodyRows), DataSourceType.Csv, file.name, file.size);
};
