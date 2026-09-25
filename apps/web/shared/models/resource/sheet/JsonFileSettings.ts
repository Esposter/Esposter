import type { JsonDataSourceConfiguration } from "#shared/models/resource/sheet/json/JsonDataSourceConfiguration";
import type { SheetLayoutSettings } from "#shared/models/resource/sheet/SheetLayoutSettings";
import type { ItemEntityType } from "@esposter/shared";

import { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";
import { jsonDataSourceConfigurationSchema } from "#shared/models/resource/sheet/json/JsonDataSourceConfiguration";
import { sheetLayoutSettingsSchema } from "#shared/models/resource/sheet/SheetLayoutSettings";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { z } from "zod";

export interface JsonFileSettings extends ItemEntityType<DataSourceType.Json>, SheetLayoutSettings {
  configuration: JsonDataSourceConfiguration;
}

export const jsonFileSettingsSchema = z.object({
  ...createItemEntityTypeSchema(z.literal(DataSourceType.Json).readonly()).shape,
  ...sheetLayoutSettingsSchema.shape,
  configuration: jsonDataSourceConfigurationSchema,
}) satisfies z.ZodType<JsonFileSettings>;
