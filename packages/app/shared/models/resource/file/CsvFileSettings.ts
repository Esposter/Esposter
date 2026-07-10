import type { CsvDataSourceConfiguration } from "#shared/models/resource/file/csv/CsvDataSourceConfiguration";
import type { ItemEntityType } from "@esposter/shared";

import { csvDataSourceConfigurationSchema } from "#shared/models/resource/file/csv/CsvDataSourceConfiguration";
import { DataSourceType } from "#shared/models/resource/file/datasource/DataSourceType";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { z } from "zod";

export interface CsvFileSettings extends ItemEntityType<DataSourceType.Csv> {
  configuration: CsvDataSourceConfiguration;
}

export const csvFileSettingsSchema = z.object({
  ...createItemEntityTypeSchema(z.literal(DataSourceType.Csv).readonly()).shape,
  configuration: csvDataSourceConfigurationSchema,
}) satisfies z.ZodType<CsvFileSettings>;
