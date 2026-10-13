import type { DatasetColumnType } from "#shared/models/dataset/DatasetColumnType";

import { datasetColumnTypeSchema } from "#shared/models/dataset/DatasetColumnType";
import { MAX_RESOURCE_CONTENT_SIZE } from "#shared/services/resource/constants";
import { z } from "zod";

export interface DatasetColumn {
  name: string;
  // The header a file prints in place of the name, for a column whose name is not what a person reads
  title?: string;
  type: DatasetColumnType;
}

export const datasetColumnSchema = z.object({
  name: z.string().min(1).max(MAX_RESOURCE_CONTENT_SIZE),
  title: z.string().min(1).max(MAX_RESOURCE_CONTENT_SIZE).optional(),
  type: datasetColumnTypeSchema,
}) satisfies z.ZodType<DatasetColumn>;
