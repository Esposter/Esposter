import type { CsvDataSourceItem } from "#shared/models/tableEditor/file/csv/CsvDataSourceItem";
import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";

import { DataSourceType } from "#shared/models/tableEditor/file/datasource/DataSourceType";
import { deserializeCsvLine } from "@/services/tableEditor/file/csv/deserializeCsvLine";
import { buildDataset } from "@/services/tableEditor/file/dataSource/buildDataset";
import { datasetToDataSource } from "@/services/tableEditor/file/dataSource/datasetToDataSource";
import { normalizeString, takeOne } from "@esposter/shared";

export const deserializeCsv = async (file: File, item: CsvDataSourceItem): Promise<DataSource> => {
  const text = await file.text();
  const lines = text.split(/\r?\n/u).filter((line) => normalizeString(line) !== "");
  if (lines.length === 0) return datasetToDataSource(buildDataset([], []), DataSourceType.Csv, file.name, file.size);
  const sourceNames = deserializeCsvLine(takeOne(lines), item.configuration.delimiter).map(
    (sourceName, index) => normalizeString(sourceName) || `Column ${index + 1}`,
  );
  const bodyRows = lines.slice(1).map((line) => deserializeCsvLine(line, item.configuration.delimiter));
  return datasetToDataSource(buildDataset(sourceNames, bodyRows), DataSourceType.Csv, file.name, file.size);
};
