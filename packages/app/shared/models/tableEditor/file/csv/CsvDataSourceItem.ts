import type { CsvDataSourceConfiguration } from "#shared/models/tableEditor/file/csv/CsvDataSourceConfiguration";
import type { ToData } from "@esposter/shared";

import { csvDataSourceConfigurationSchema } from "#shared/models/tableEditor/file/csv/CsvDataSourceConfiguration";
import { CsvDelimiter } from "#shared/models/tableEditor/file/csv/CsvDelimiter";
import {
  ADataSourceItem,
  createDataSourceItemSchema,
} from "#shared/models/tableEditor/file/datasource/ADataSourceItem";
import { DataSourceType } from "#shared/models/tableEditor/file/datasource/DataSourceType";
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
