import type { Column } from "#shared/models/tableEditor/file/Column";
import type { ColumnValue } from "#shared/models/tableEditor/file/ColumnValue";
import type { DataSourceStats } from "#shared/models/tableEditor/file/DataSourceStats";
import type { DateColumn } from "#shared/models/tableEditor/file/DateColumn";
import type { Metadata } from "#shared/models/tableEditor/file/Metadata";
import type { ToData } from "@esposter/shared";

import { columnItemSchema } from "#shared/models/tableEditor/file/ColumnItemSchema";
import { columnValueSchema } from "#shared/models/tableEditor/file/ColumnValue";
import { dataSourceStatsSchema } from "#shared/models/tableEditor/file/DataSourceStats";
import { metadataSchema } from "#shared/models/tableEditor/file/Metadata";
import { z } from "zod";

export interface DataSource {
  columns: (Column | DateColumn)[];
  metadata: Metadata;
  rows: Record<string, ColumnValue>[];
  stats: DataSourceStats;
}

export const dataSourceSchema = z.object({
  columns: z.array(columnItemSchema),
  metadata: metadataSchema,
  rows: z.array(z.record(z.string(), columnValueSchema)),
  stats: dataSourceStatsSchema,
}) satisfies z.ZodType<ToData<DataSource>>;
