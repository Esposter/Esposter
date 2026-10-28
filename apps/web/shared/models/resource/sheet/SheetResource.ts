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

// oxlint-disable-next-line typescript/no-unsafe-enum-assignment -- the enums are the same declarations the nested dataSourceSchema names (DataSource.ts:19); the rule flags a zod object nested in an object even on an exact enum match
export const sheetResourceSchema = z.object({
  data: dataSourceSchema,
  settings: sheetSettingsSchema,
}) satisfies z.ZodType<ToData<SheetResource>>;
