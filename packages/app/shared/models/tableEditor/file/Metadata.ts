import type { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";

import { dataSourceTypeSchema } from "#shared/models/tableEditor/file/DataSourceType";
import { z } from "zod";

export interface Metadata {
  columnCount: number;
  dataSourceType: DataSourceType;
  importedAt: Date;
  name: string;
  rowCount: number;
  size?: number;
}

export const metadataSchema = z.object({
  columnCount: z.number(),
  dataSourceType: dataSourceTypeSchema,
  importedAt: z.date(),
  name: z.string(),
  rowCount: z.number(),
  size: z.number().optional(),
}) satisfies z.ZodType<Metadata>;
