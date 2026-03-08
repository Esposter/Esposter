import type { Column } from "#shared/models/tableEditor/file/Column";
import type { ColumnValue } from "#shared/models/tableEditor/file/ColumnValue";
import type { DataSourceStats } from "#shared/models/tableEditor/file/DataSourceStats";
import type { DateColumn } from "#shared/models/tableEditor/file/DateColumn";
import type { Metadata } from "#shared/models/tableEditor/file/Metadata";
import type { ToData } from "@esposter/shared";
import type { Except } from "type-fest";

import { columnSchema } from "#shared/models/tableEditor/file/Column";
import { columnValueSchema } from "#shared/models/tableEditor/file/ColumnValue";
import { dataSourceStatsSchema } from "#shared/models/tableEditor/file/DataSourceStats";
import { dateColumnSchema } from "#shared/models/tableEditor/file/DateColumn";
import { metadataSchema } from "#shared/models/tableEditor/file/Metadata";
import { z } from "zod";

export interface DataSource {
  columns: (Column | DateColumn)[];
  metadata: Metadata;
  rows: Record<string, ColumnValue>[];
  stats: DataSourceStats;
}

export const dataSourceSchema = z.object({
  columns: z.array(z.union([dateColumnSchema, columnSchema])),
  metadata: metadataSchema,
  rows: z.array(z.record(z.string(), columnValueSchema)),
  stats: dataSourceStatsSchema,
}) satisfies z.ZodType<Except<DataSource, "columns"> & { columns: (ToData<Column> | ToData<DateColumn>)[] }>;
