import type { CsvDataSourceConfiguration } from "#shared/models/resource/file/csv/CsvDataSourceConfiguration";
import type { DataSourceType } from "#shared/models/resource/file/datasource/DataSourceType";
import type { JsonDataSourceConfiguration } from "#shared/models/resource/file/json/JsonDataSourceConfiguration";
import type { XlsxDataSourceConfiguration } from "#shared/models/resource/file/xlsx/XlsxDataSourceConfiguration";

export interface DataSourceConfigurationTypeMap {
  [DataSourceType.Csv]: CsvDataSourceConfiguration;
  [DataSourceType.Json]: JsonDataSourceConfiguration;
  [DataSourceType.Xlsx]: XlsxDataSourceConfiguration;
}
