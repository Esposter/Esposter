import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";
import type { DataSourceConfiguration } from "@/models/tableEditor/file/DataSourceConfiguration";

import { csvDataSourceConfigurationSchema } from "#shared/models/tableEditor/file/CsvDataSourceConfiguration";
import { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";
import { parseCsv } from "@/services/tableEditor/file/csv/parseCsv";

export const DataSourceConfigurationMap = {
  [DataSourceType.Csv]: {
    accept: ".csv",
    parse: parseCsv,
    schema: csvDataSourceConfigurationSchema,
  },
} as const satisfies {
  [P in keyof DataSourceItemTypeMap]: DataSourceConfiguration<DataSourceItemTypeMap[P]>;
};
