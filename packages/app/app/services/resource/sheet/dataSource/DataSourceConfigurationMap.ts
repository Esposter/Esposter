import type { SheetSettings } from "#shared/models/resource/sheet/SheetSettings";
import type { DataSourceConfiguration } from "@/models/resource/sheet/dataSource/DataSourceConfiguration";

import { MimeType } from "#shared/models/file/MimeType";
import { csvDataSourceConfigurationSchema } from "#shared/models/resource/sheet/csv/CsvDataSourceConfiguration";
import { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";
import { jsonDataSourceConfigurationSchema } from "#shared/models/resource/sheet/json/JsonDataSourceConfiguration";
import { xlsxDataSourceConfigurationSchema } from "#shared/models/resource/sheet/xlsx/XlsxDataSourceConfiguration";
import { deserializeCsv } from "@/services/resource/sheet/csv/deserializeCsv";
import { serializeCsv } from "@/services/resource/sheet/csv/serializeCsv";
import { deserializeJson } from "@/services/resource/sheet/json/deserializeJson";
import { serializeJson } from "@/services/resource/sheet/json/serializeJson";
import { deserializeXlsx } from "@/services/resource/sheet/xlsx/deserializeXlsx";
import { serializeXlsx } from "@/services/resource/sheet/xlsx/serializeXlsx";

export const DataSourceConfigurationMap: Record<DataSourceType, DataSourceConfiguration<SheetSettings>> = {
  [DataSourceType.Csv]: {
    accept: ".csv",
    deserialize: deserializeCsv,
    mimeType: MimeType.Csv,
    schema: csvDataSourceConfigurationSchema,
    serialize: serializeCsv,
  },
  [DataSourceType.Json]: {
    accept: ".json",
    deserialize: deserializeJson,
    mimeType: MimeType.Json,
    schema: jsonDataSourceConfigurationSchema,
    serialize: serializeJson,
  },
  [DataSourceType.Xlsx]: {
    accept: ".xlsx",
    deserialize: deserializeXlsx,
    mimeType: MimeType.Xlsx,
    schema: xlsxDataSourceConfigurationSchema,
    serialize: serializeXlsx,
  },
};
