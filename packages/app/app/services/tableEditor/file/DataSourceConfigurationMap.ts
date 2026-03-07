import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";
import type { DataSourceConfiguration } from "@/models/tableEditor/file/DataSourceConfiguration";

import { csvDataSourceConfigurationSchema } from "#shared/models/tableEditor/file/csv/CsvDataSourceConfiguration";
import { xlsxDataSourceConfigurationSchema } from "#shared/models/tableEditor/file/xlsx/XlsxDataSourceConfiguration";
import { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";
import { parseCsv } from "@/services/tableEditor/file/csv/parseCsv";
import { parseXlsx } from "@/services/tableEditor/file/xlsx/parseXlsx";

export const DataSourceConfigurationMap = {
  [DataSourceType.Csv]: {
    accept: ".csv",
    parse: parseCsv,
    schema: csvDataSourceConfigurationSchema,
  },
  [DataSourceType.Xlsx]: {
    accept: ".xlsx",
    parse: parseXlsx,
    schema: xlsxDataSourceConfigurationSchema,
  },
} as const satisfies {
  [P in keyof DataSourceItemTypeMap]: DataSourceConfiguration<DataSourceItemTypeMap[P]>;
};
