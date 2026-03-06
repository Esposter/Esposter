import type { ToData } from "@esposter/shared";

import { ADataSourceItem, aDataSourceItemSchema } from "#shared/models/tableEditor/file/ADataSourceItem";
import { CsvDelimiter, csvDelimiterSchema } from "#shared/models/tableEditor/file/CsvDelimiter";
import { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";
import { z } from "zod";

export class CsvDataSourceItem extends ADataSourceItem<DataSourceType.Csv> {
  delimiter = CsvDelimiter.Comma;
  override readonly type = DataSourceType.Csv as const;

  constructor(init?: Partial<CsvDataSourceItem>) {
    super();
    Object.assign(this, init);
  }
}

export const csvDataSourceItemSchema = z.object({
  ...aDataSourceItemSchema.shape,
  delimiter: csvDelimiterSchema,
  type: z.literal(DataSourceType.Csv),
}) satisfies z.ZodType<ToData<CsvDataSourceItem>>;
