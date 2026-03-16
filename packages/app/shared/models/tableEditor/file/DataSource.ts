import type { Column } from "#shared/models/tableEditor/file/Column";
import type { DataSourceStats } from "#shared/models/tableEditor/file/DataSourceStats";
import type { DateColumn } from "#shared/models/tableEditor/file/DateColumn";
import type { Metadata } from "#shared/models/tableEditor/file/Metadata";
import type { Row } from "#shared/models/tableEditor/file/Row";
import type { ToData } from "@esposter/shared";

import { columnItemSchema } from "#shared/models/tableEditor/file/ColumnItemSchema";
import { dataSourceStatsSchema } from "#shared/models/tableEditor/file/DataSourceStats";
import { metadataSchema } from "#shared/models/tableEditor/file/Metadata";
import { rowSchema } from "#shared/models/tableEditor/file/Row";
import { z } from "zod";

export interface DataSource {
  columns: (Column<ColumnType.Boolean> | Column<ColumnType.Number> | Column<ColumnType.String> | DateColumn)[];
  metadata: Metadata;
  rows: Row[];
  stats: DataSourceStats;
}

export const dataSourceSchema = z.object({
  columns: z.array(columnItemSchema),
  metadata: metadataSchema,
  rows: z.array(rowSchema),
  stats: dataSourceStatsSchema,
}) satisfies z.ZodType<ToData<DataSource>>;
