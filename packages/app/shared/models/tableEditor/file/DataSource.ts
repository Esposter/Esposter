import type { Column } from "#shared/models/tableEditor/file/Column";
import type { ColumnValue } from "#shared/models/tableEditor/file/ColumnValue";
import type { Metadata } from "#shared/models/tableEditor/file/Metadata";
import type { Except } from "type-fest";
import type { ToData } from "@esposter/shared";

import { columnSchema } from "#shared/models/tableEditor/file/Column";
import { columnValueSchema } from "#shared/models/tableEditor/file/ColumnValue";
import { metadataSchema } from "#shared/models/tableEditor/file/Metadata";
import { z } from "zod";

export interface DataSource {
  columns: Column[];
  metadata: Metadata;
  rows: Record<string, ColumnValue>[];
}

export const dataSourceSchema = z.object({
  columns: z.array(columnSchema),
  metadata: metadataSchema,
  rows: z.array(z.record(z.string(), columnValueSchema)),
}) satisfies z.ZodType<Except<DataSource, "columns"> & { columns: ToData<Column>[] }>;
