import type { CsvFileSettings } from "#shared/models/resource/sheet/CsvFileSettings";

import { CsvDelimiter } from "#shared/models/resource/sheet/csv/CsvDelimiter";
import { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";
import { DataSourceConfigurationMap } from "@/services/resource/sheet/dataSource/DataSourceConfigurationMap";
import { describe } from "vitest";

export const CSV_MIME_TYPE = DataSourceConfigurationMap[DataSourceType.Csv].mimeType;

export const CSV_SETTINGS: CsvFileSettings = {
  configuration: { delimiter: CsvDelimiter.Comma },
  type: DataSourceType.Csv,
};

// The delimiter both codecs are driven with to prove they read the setting rather than the comma default
export const CSV_SEMICOLON_SETTINGS: CsvFileSettings = {
  configuration: { delimiter: CsvDelimiter.Semicolon },
  type: DataSourceType.Csv,
};

describe.todo("constants");
