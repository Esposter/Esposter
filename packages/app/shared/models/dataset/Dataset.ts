import type { DatasetColumn } from "#shared/models/dataset/DatasetColumn";
import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";

import { datasetColumnSchema } from "#shared/models/dataset/DatasetColumn";
import { columnValueSchema } from "#shared/models/resource/sheet/column/ColumnValue";
import { z } from "zod";

export interface Dataset {
  columns: DatasetColumn[];
  rows: Record<string, ColumnValue>[];
  // The uncapped row count, so consumers can tell a complete read from one the AZURE_MAX_PAGE_SIZE cap
  // Truncated; a provider that cannot cheaply count omits it and its consumers simply never warn
  totalRows?: number;
}

export const datasetSchema = z.object({
  columns: z.array(datasetColumnSchema),
  rows: z.array(z.record(z.string(), columnValueSchema)),
  totalRows: z.number().optional(),
}) satisfies z.ZodType<Dataset>;
