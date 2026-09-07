import type { DatasetColumnType } from "#shared/models/dataset/DatasetColumnType";

import { datasetColumnTypeSchema } from "#shared/models/dataset/DatasetColumnType";
import { z } from "zod";

export interface DatasetColumn {
  name: string;
  type: DatasetColumnType;
}

export const datasetColumnSchema = z.object({
  name: z.string().min(1),
  type: datasetColumnTypeSchema,
}) satisfies z.ZodType<DatasetColumn>;
