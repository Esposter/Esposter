import type { FileSettings } from "#shared/models/resource/file/FileSettings";
import type { DataSource } from "#shared/models/resource/file/datasource/DataSource";
import type { ToData } from "@esposter/shared";

import { fileSettingsSchema } from "#shared/models/resource/file/FileSettings";
import { dataSourceSchema } from "#shared/models/resource/file/datasource/DataSource";
import { z } from "zod";

export interface FileResource {
  data: DataSource;
  settings: FileSettings;
}

export const fileResourceSchema = z.object({
  data: dataSourceSchema,
  settings: fileSettingsSchema,
}) satisfies z.ZodType<ToData<FileResource>>;
