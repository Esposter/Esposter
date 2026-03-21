import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { JsonDataSourceItem } from "#shared/models/tableEditor/file/json/JsonDataSourceItem";

import { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";
import { buildDataSource } from "@/services/tableEditor/file/dataSource/buildDataSource";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";
import { z } from "zod";

const jsonRowsSchema = z.array(z.record(z.string(), z.unknown()));

export const deserializeJson = async (file: File, _item: JsonDataSourceItem): Promise<DataSource> => {
  const text = await file.text();
  const result = jsonRowsSchema.safeParse(JSON.parse(text));
  if (!result.success) throw new InvalidOperationError(Operation.Read, file.name, result.error.message);
  const rows = result.data;
  if (rows.length === 0) return buildDataSource(file, DataSourceType.Json, [], []);
  const sourceNames = Object.keys(takeOne(rows));
  const bodyRows = rows.map((row) => sourceNames.map((sourceName) => String(takeOne(row, sourceName))));
  return buildDataSource(file, DataSourceType.Json, sourceNames, bodyRows);
};
