import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";
import type { DataSourceConfiguration } from "@/models/tableEditor/file/DataSourceConfiguration";

import { CsvDelimiter } from "#shared/models/tableEditor/file/CsvDelimiter";
import { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";
import { parseCsv } from "@/services/tableEditor/file/parsers/parseCsv";

export const DataSourceConfigurationMap = {
  [DataSourceType.Csv]: {
    accept: ".csv",
    parse: parseCsv,
    schema: {
      properties: {
        delimiter: {
          oneOf: [
            { const: CsvDelimiter.Comma, title: "Comma (,)" },
            { const: CsvDelimiter.Pipe, title: "Pipe (|)" },
            { const: CsvDelimiter.Semicolon, title: "Semicolon (;)" },
            { const: CsvDelimiter.Tab, title: "Tab" },
          ],
          title: "Delimiter",
          type: "string",
        },
      },
      type: "object",
    },
  },
} as const satisfies Partial<{
  [P in keyof DataSourceItemTypeMap]: DataSourceConfiguration<DataSourceItemTypeMap[P]>;
}>;
