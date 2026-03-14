import type { JsonDataSourceConfiguration } from "#shared/models/tableEditor/file/json/JsonDataSourceConfiguration";
import type { ToData } from "@esposter/shared";

import { ADataSourceItem, createDataSourceItemSchema } from "#shared/models/tableEditor/file/ADataSourceItem";
import { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";
import { jsonDataSourceConfigurationSchema } from "#shared/models/tableEditor/file/json/JsonDataSourceConfiguration";
import { z } from "zod";

export class JsonDataSourceItem extends ADataSourceItem<DataSourceType.Json> {
  configuration: JsonDataSourceConfiguration = {};
  override readonly type = DataSourceType.Json;

  constructor(init?: Partial<JsonDataSourceItem>) {
    super();
    Object.assign(this, init);
  }
}

export const jsonDataSourceItemSchema = createDataSourceItemSchema(
  z.literal(DataSourceType.Json),
  jsonDataSourceConfigurationSchema,
) satisfies z.ZodType<ToData<JsonDataSourceItem>>;
