import type { DatasetColumnType } from "#shared/models/dataset/DatasetColumnType";

import { datasetColumnTypeSchema } from "#shared/models/dataset/DatasetColumnType";
import { z } from "zod";
import { MAX_RESOURCE_CONTENT_LENGTH } from "#shared/services/resource/constants";

export interface DatasetColumn {
  name: string;
  type: DatasetColumnType;
}

export const datasetColumnSchema = z.object({
  name: z.string().min(1).max(MAX_RESOURCE_CONTENT_LENGTH),
  type: datasetColumnTypeSchema,
}) satisfies z.ZodType<DatasetColumn>;
