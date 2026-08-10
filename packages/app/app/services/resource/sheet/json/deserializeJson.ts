import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { JsonFileSettings } from "#shared/models/resource/sheet/JsonFileSettings";

import { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";
import { deserializeToDataSource } from "@/services/resource/sheet/dataSource/deserializeToDataSource";
import { getResult, InvalidOperationError, Operation, takeOne } from "@esposter/shared";
import { z } from "zod";

const jsonRowsSchema = z.array(z.record(z.string(), z.unknown()));
// A JSON null and an absent property both become an empty cell, which coerces back to null the way
// The CSV path already does. String() alone would persist them as the text "null" and "undefined",
// And a container as "[object Object]" - each branch narrows so only a real primitive is stringified.
const getCellText = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  else if (typeof value === "string") return value;
  else if (typeof value === "boolean" || typeof value === "number") return String(value);
  else return JSON.stringify(value);
};

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
  const bodyRows = rows.map((row) => sourceNames.map((sourceName) => getCellText(takeOne(row, sourceName))));
  return deserializeToDataSource(sourceNames, bodyRows, DataSourceType.Json, file);
};
