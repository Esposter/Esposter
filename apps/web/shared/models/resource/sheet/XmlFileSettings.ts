import type { SheetLayoutSettings } from "#shared/models/resource/sheet/SheetLayoutSettings";
import type { XmlDataSourceConfiguration } from "#shared/models/resource/sheet/xml/XmlDataSourceConfiguration";
import type { ItemEntityType } from "@esposter/shared";

import { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";
import { sheetLayoutSettingsSchema } from "#shared/models/resource/sheet/SheetLayoutSettings";
import { xmlDataSourceConfigurationSchema } from "#shared/models/resource/sheet/xml/XmlDataSourceConfiguration";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { z } from "zod";

export interface XmlFileSettings extends ItemEntityType<DataSourceType.Xml>, SheetLayoutSettings {
  configuration: XmlDataSourceConfiguration;
}

export const xmlFileSettingsSchema = z.object({
  ...createItemEntityTypeSchema(z.literal(DataSourceType.Xml).readonly()).shape,
  ...sheetLayoutSettingsSchema.shape,
  configuration: xmlDataSourceConfigurationSchema,
}) satisfies z.ZodType<XmlFileSettings>;
