import type { FileSettings } from "#shared/models/resource/file/FileSettings";
import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";
import type { ToData } from "@esposter/shared";

import { fileSettingsSchema } from "#shared/models/resource/file/FileSettings";
import { dataSourceSchema } from "#shared/models/tableEditor/file/datasource/DataSource";
import { z } from "zod";

export interface FileResource {
  data: ToData<DataSource>;
  settings: FileSettings;
}

export const fileResourceSchema = z.object({
  data: dataSourceSchema,
  settings: fileSettingsSchema,
}) satisfies z.ZodType<FileResource>;
