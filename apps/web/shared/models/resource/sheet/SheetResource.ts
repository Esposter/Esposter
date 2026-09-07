import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { SheetSettings } from "#shared/models/resource/sheet/SheetSettings";
import type { ToData } from "@esposter/shared";

import { dataSourceSchema } from "#shared/models/resource/sheet/datasource/DataSource";
import { sheetSettingsSchema } from "#shared/models/resource/sheet/SheetSettings";
import { z } from "zod";

export interface SheetResource {
  data: DataSource;
  settings: SheetSettings;
}

export const sheetResourceSchema = z.object({
  data: dataSourceSchema,
  settings: sheetSettingsSchema,
}) satisfies z.ZodType<ToData<SheetResource>>;
