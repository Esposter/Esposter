import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { JsonFileSettings } from "#shared/models/resource/sheet/JsonFileSettings";

import { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";
import { deserializeToDataSource } from "@/services/resource/sheet/dataSource/deserializeToDataSource";
import { getResult, InvalidOperationError, Operation, takeOne } from "@esposter/shared";
import { z } from "zod";

const jsonRowsSchema = z.array(z.record(z.string(), z.unknown()));

export const deserializeJson = async (file: File, _settings: JsonFileSettings): Promise<DataSource> => {
  const text = await file.text();
  // Plain JSON.parse preserves an imported ISO-datetime cell as its original string instead of
  // Reviving it to a Date that String() would then stringify to a different, locale-shaped value.
  // eslint-disable-next-line no-restricted-syntax -- an imported cell keeps the string it was written as
  const rows = getResult(() => jsonRowsSchema.parse(JSON.parse(text))).match(
    (parsed) => parsed,
    (error) => {
      throw new InvalidOperationError(Operation.Read, file.name, error.message);
    },
  );
  const [firstRow] = rows;
  const sourceNames = firstRow ? Object.keys(firstRow) : [];
  const bodyRows = rows.map((row) => sourceNames.map((sourceName) => String(takeOne(row, sourceName))));
  return deserializeToDataSource(sourceNames, bodyRows, DataSourceType.Json, file);
};
