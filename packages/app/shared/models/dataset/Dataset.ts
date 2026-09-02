import type { DatasetColumn } from "#shared/models/dataset/DatasetColumn";
import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";

import { datasetColumnSchema } from "#shared/models/dataset/DatasetColumn";
import { columnValueSchema } from "#shared/models/resource/sheet/column/ColumnValue";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

export interface Dataset {
  columns: DatasetColumn[];
  // Columns whose values a capped read may have got *wrong* rather than left out. A derived column resolved
  // Against a second capped read reports its unmatched rows as a negative — every row is present, so row
  // Counts look complete — which makes an exact aggregation over such a column a floor rather than a total
  partialColumns?: string[];
  rows: Record<string, ColumnValue>[];
  // The uncapped row count, so consumers can tell a complete read from one the AZURE_MAX_PAGE_SIZE cap
  // Truncated; a provider that cannot cheaply count omits it and its consumers simply never warn
  totalRows?: number;
}

export const datasetSchema = z.object({
  // A row is keyed by column name, so two columns sharing one cannot both be read - the uniqueness the array
  // Declares is the one the row shape already depends on
  columns: createUniqueArraySchema(datasetColumnSchema, "name"),
  partialColumns: createUniqueArraySchema(z.string()).optional(),
  // The one array here duplicates are valid in: two rows holding identical values are two rows
  rows: z.array(z.record(z.string(), columnValueSchema)),
  totalRows: z.int().nonnegative().optional(),
}) satisfies z.ZodType<Dataset>;
