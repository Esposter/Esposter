import type { FileSettings } from "#shared/models/resource/file/FileSettings";
import type { DataSourceConfiguration } from "@/models/resource/file/dataSource/DataSourceConfiguration";

import { MimeType } from "#shared/models/file/MimeType";
import { csvDataSourceConfigurationSchema } from "#shared/models/resource/file/csv/CsvDataSourceConfiguration";
import { DataSourceType } from "#shared/models/resource/file/datasource/DataSourceType";
import { jsonDataSourceConfigurationSchema } from "#shared/models/resource/file/json/JsonDataSourceConfiguration";
import { xlsxDataSourceConfigurationSchema } from "#shared/models/resource/file/xlsx/XlsxDataSourceConfiguration";
import { deserializeCsv } from "@/services/resource/file/csv/deserializeCsv";
import { serializeCsv } from "@/services/resource/file/csv/serializeCsv";
import { deserializeJson } from "@/services/resource/file/json/deserializeJson";
import { serializeJson } from "@/services/resource/file/json/serializeJson";
import { deserializeXlsx } from "@/services/resource/file/xlsx/deserializeXlsx";
import { serializeXlsx } from "@/services/resource/file/xlsx/serializeXlsx";

export const DataSourceConfigurationMap: Record<DataSourceType, DataSourceConfiguration<FileSettings>> = {
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
