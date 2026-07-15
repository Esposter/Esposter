import type { DatasetColumn } from "#shared/models/dataset/DatasetColumn";
import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";

import { datasetColumnSchema } from "#shared/models/dataset/DatasetColumn";
import { columnValueSchema } from "#shared/models/resource/sheet/column/ColumnValue";
import { z } from "zod";

export interface Dataset {
  columns: DatasetColumn[];
  rows: Record<string, ColumnValue>[];
}

export const datasetSchema = z.object({
  columns: z.array(datasetColumnSchema),
  rows: z.array(z.record(z.string(), columnValueSchema)),
}) satisfies z.ZodType<Dataset>;
