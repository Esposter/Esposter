import type { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";

import { dataSourceTypeSchema } from "#shared/models/tableEditor/file/DataSourceType";
import { z } from "zod";

export interface Metadata {
  dataSourceType: DataSourceType;
  importedAt: Date;
  name: string;
  size: number;
}

export const metadataSchema = z.object({
  dataSourceType: dataSourceTypeSchema,
  importedAt: z.date(),
  name: z.string(),
  size: z.number().int().nonnegative(),
}) satisfies z.ZodType<Metadata>;
