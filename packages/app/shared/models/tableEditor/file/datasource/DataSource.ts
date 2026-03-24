import type { Column } from "#shared/models/tableEditor/file/column/Column";
import type { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import type { ComputedColumn } from "#shared/models/tableEditor/file/column/ComputedColumn";
import type { DateColumn } from "#shared/models/tableEditor/file/column/DateColumn";
import type { DataSourceStats } from "#shared/models/tableEditor/file/datasource/DataSourceStats";
import type { Metadata } from "#shared/models/tableEditor/file/datasource/Metadata";
import type { Row } from "#shared/models/tableEditor/file/datasource/Row";
import type { ToData } from "@esposter/shared";

import { columnItemSchema } from "#shared/models/tableEditor/file/column/ColumnItemSchema";
import { dataSourceStatsSchema } from "#shared/models/tableEditor/file/datasource/DataSourceStats";
import { metadataSchema } from "#shared/models/tableEditor/file/datasource/Metadata";
import { rowSchema } from "#shared/models/tableEditor/file/datasource/Row";
import { z } from "zod";

export interface DataSource {
  columns: (Column | Column<ColumnType.Boolean> | Column<ColumnType.Number> | ComputedColumn | DateColumn)[];
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
