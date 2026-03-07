import type { DataSourceConfiguration } from "@/models/tableEditor/file/DataSourceConfiguration";

import { CsvDataSourceItem } from "#shared/models/tableEditor/file/CsvDataSourceItem";
import { CsvDelimiter } from "#shared/models/tableEditor/file/CsvDelimiter";
import { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";
import { CsvParser } from "@/models/tableEditor/file/parsers/CsvParser";

export const DataSourceConfigurationMap = {
  [DataSourceType.Csv]: {
    accept: ".csv",
    createItem: () => new CsvDataSourceItem(),
    parse: (file, item) => new CsvParser().parse(file, item),
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
} as const satisfies Partial<Record<DataSourceType, DataSourceConfiguration>>;
