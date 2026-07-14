import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { JsonFileSettings } from "#shared/models/resource/sheet/JsonFileSettings";

import { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";
import { buildDataset } from "@/services/resource/sheet/dataSource/buildDataset";
import { datasetToDataSource } from "@/services/resource/sheet/dataSource/datasetToDataSource";
import { InvalidOperationError, jsonDateParse, Operation, takeOne } from "@esposter/shared";
import { z } from "zod";

const jsonRowsSchema = z.array(z.record(z.string(), z.unknown()));

export const deserializeJson = async (file: File, _settings: JsonFileSettings): Promise<DataSource> => {
  const text = await file.text();
  const result = jsonRowsSchema.safeParse(jsonDateParse(text));
  if (!result.success) throw new InvalidOperationError(Operation.Read, file.name, result.error.message);
  const rows = result.data;
  if (rows.length === 0) return datasetToDataSource(buildDataset([], []), DataSourceType.Json, file.name, file.size);
  const sourceNames = Object.keys(takeOne(rows));
  const bodyRows = rows.map((row) => sourceNames.map((sourceName) => String(takeOne(row, sourceName))));
  return datasetToDataSource(buildDataset(sourceNames, bodyRows), DataSourceType.Json, file.name, file.size);
};
