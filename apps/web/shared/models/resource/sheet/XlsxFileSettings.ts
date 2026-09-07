import type { XlsxDataSourceConfiguration } from "#shared/models/resource/sheet/xlsx/XlsxDataSourceConfiguration";
import type { ItemEntityType } from "@esposter/shared";

import { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";
import { xlsxDataSourceConfigurationSchema } from "#shared/models/resource/sheet/xlsx/XlsxDataSourceConfiguration";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { z } from "zod";

export interface XlsxFileSettings extends ItemEntityType<DataSourceType.Xlsx> {
  configuration: XlsxDataSourceConfiguration;
}

export const xlsxFileSettingsSchema = z.object({
  ...createItemEntityTypeSchema(z.literal(DataSourceType.Xlsx).readonly()).shape,
  configuration: xlsxDataSourceConfigurationSchema,
}) satisfies z.ZodType<XlsxFileSettings>;
