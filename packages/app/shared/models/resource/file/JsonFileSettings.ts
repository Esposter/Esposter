import type { JsonDataSourceConfiguration } from "#shared/models/tableEditor/file/json/JsonDataSourceConfiguration";
import type { ItemEntityType } from "@esposter/shared";

import { DataSourceType } from "#shared/models/tableEditor/file/datasource/DataSourceType";
import { jsonDataSourceConfigurationSchema } from "#shared/models/tableEditor/file/json/JsonDataSourceConfiguration";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { z } from "zod";

export interface JsonFileSettings extends ItemEntityType<DataSourceType.Json> {
  configuration: JsonDataSourceConfiguration;
}

export const jsonFileSettingsSchema = z.object({
  ...createItemEntityTypeSchema(z.literal(DataSourceType.Json).readonly()).shape,
  configuration: jsonDataSourceConfigurationSchema,
}) satisfies z.ZodType<JsonFileSettings>;
