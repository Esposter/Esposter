import type { CsvDataSourceConfiguration } from "#shared/models/tableEditor/file/CsvDataSourceConfiguration";
import type { ToData } from "@esposter/shared";

import { ADataSourceItem, createDataSourceItemSchema } from "#shared/models/tableEditor/file/ADataSourceItem";
import { csvDataSourceConfigurationSchema } from "#shared/models/tableEditor/file/CsvDataSourceConfiguration";
import { CsvDelimiter } from "#shared/models/tableEditor/file/CsvDelimiter";
import { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";
import { z } from "zod";

export class CsvDataSourceItem extends ADataSourceItem<DataSourceType.Csv> {
  configuration: CsvDataSourceConfiguration = { delimiter: CsvDelimiter.Comma };
  override readonly type = DataSourceType.Csv;

  constructor(init?: Partial<CsvDataSourceItem>) {
    super();
    Object.assign(this, init);
  }
}

export const csvDataSourceItemSchema = createDataSourceItemSchema(
  z.literal(DataSourceType.Csv),
  csvDataSourceConfigurationSchema,
) satisfies z.ZodType<ToData<CsvDataSourceItem>>;
