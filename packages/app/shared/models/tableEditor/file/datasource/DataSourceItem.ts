import type { CsvDataSourceItem } from "#shared/models/tableEditor/file/csv/CsvDataSourceItem";
import type { JsonDataSourceItem } from "#shared/models/tableEditor/file/json/JsonDataSourceItem";
import type { XlsxDataSourceItem } from "#shared/models/tableEditor/file/xlsx/XlsxDataSourceItem";

import { csvDataSourceItemSchema } from "#shared/models/tableEditor/file/csv/CsvDataSourceItem";
import { jsonDataSourceItemSchema } from "#shared/models/tableEditor/file/json/JsonDataSourceItem";
import { xlsxDataSourceItemSchema } from "#shared/models/tableEditor/file/xlsx/XlsxDataSourceItem";
import { z } from "zod";

export type DataSourceItem = CsvDataSourceItem | JsonDataSourceItem | XlsxDataSourceItem;

export const dataSourceItemSchema = z.discriminatedUnion("type", [
  csvDataSourceItemSchema,
  jsonDataSourceItemSchema,
  xlsxDataSourceItemSchema,
]) satisfies z.ZodType<DataSourceItem>;
