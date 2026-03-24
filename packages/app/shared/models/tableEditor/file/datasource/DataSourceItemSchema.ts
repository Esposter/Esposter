import { csvDataSourceItemSchema } from "#shared/models/tableEditor/file/csv/CsvDataSourceItem";
import { jsonDataSourceItemSchema } from "#shared/models/tableEditor/file/json/JsonDataSourceItem";
import { xlsxDataSourceItemSchema } from "#shared/models/tableEditor/file/xlsx/XlsxDataSourceItem";
import { z } from "zod";

export const dataSourceItemSchema = z.discriminatedUnion("type", [
  csvDataSourceItemSchema,
  jsonDataSourceItemSchema,
  xlsxDataSourceItemSchema,
]);
