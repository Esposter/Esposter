import type { CsvDataSourceConfiguration } from "#shared/models/resource/sheet/csv/CsvDataSourceConfiguration";
import type { SheetLayoutSettings } from "#shared/models/resource/sheet/SheetLayoutSettings";
import type { ItemEntityType } from "@esposter/shared";

import { csvDataSourceConfigurationSchema } from "#shared/models/resource/sheet/csv/CsvDataSourceConfiguration";
import { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";
import { sheetLayoutSettingsSchema } from "#shared/models/resource/sheet/SheetLayoutSettings";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { z } from "zod";

export interface CsvFileSettings extends ItemEntityType<DataSourceType.Csv>, SheetLayoutSettings {
  configuration: CsvDataSourceConfiguration;
}

export const csvFileSettingsSchema = z.object({
  ...createItemEntityTypeSchema(z.literal(DataSourceType.Csv).readonly()).shape,
  ...sheetLayoutSettingsSchema.shape,
  configuration: csvDataSourceConfigurationSchema,
}) satisfies z.ZodType<CsvFileSettings>;
