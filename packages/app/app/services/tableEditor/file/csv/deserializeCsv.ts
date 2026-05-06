/* oxlint-disable @typescript-eslint/prefer-nullish-coalescing */
import type { CsvDataSourceItem } from "#shared/models/tableEditor/file/csv/CsvDataSourceItem";
import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";

import { DataSourceType } from "#shared/models/tableEditor/file/datasource/DataSourceType";
import { deserializeCsvLine } from "@/services/tableEditor/file/csv/deserializeCsvLine";
import { buildDataSource } from "@/services/tableEditor/file/dataSource/buildDataSource";
import { normalizeString, takeOne } from "@esposter/shared";

export const deserializeCsv = async (file: File, item: CsvDataSourceItem): Promise<DataSource> => {
  const text = await file.text();
  const lines = text.split(/\r?\n/u).filter((line) => normalizeString(line) !== "");
  if (lines.length === 0) return buildDataSource(file, DataSourceType.Csv, [], []);
  const sourceNames = deserializeCsvLine(takeOne(lines), item.configuration.delimiter).map(
    (sourceName, index) => normalizeString(sourceName) || `Column ${index + 1}`,
  );
  const bodyRows = lines.slice(1).map((line) => deserializeCsvLine(line, item.configuration.delimiter));
  return buildDataSource(file, DataSourceType.Csv, sourceNames, bodyRows);
};
