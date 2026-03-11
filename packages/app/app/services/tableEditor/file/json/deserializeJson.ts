import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { JsonDataSourceItem } from "#shared/models/tableEditor/file/json/JsonDataSourceItem";

import { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";
import { buildDataSource } from "@/services/tableEditor/file/buildDataSource";
import { takeOne } from "@esposter/shared";

export const deserializeJson = async (file: File, _item: JsonDataSourceItem): Promise<DataSource> => {
  const text = await file.text();
  const rows = JSON.parse(text) as Record<string, unknown>[];
  if (rows.length === 0) return buildDataSource(file, DataSourceType.Json, [], []);
  const sourceNames = Object.keys(takeOne(rows));
  const bodyRows = rows.map((row) => sourceNames.map((sourceName) => String(takeOne(row, sourceName))));
  return buildDataSource(file, DataSourceType.Json, sourceNames, bodyRows);
};
