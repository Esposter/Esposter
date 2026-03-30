import type { Column } from "#shared/models/tableEditor/file/column/Column";
import type { DataSourceStats } from "#shared/models/tableEditor/file/datasource/DataSourceStats";
import type { Metadata } from "#shared/models/tableEditor/file/datasource/Metadata";
import type { Row } from "#shared/models/tableEditor/file/datasource/Row";
import type { ToData } from "@esposter/shared";

import { columnSchema } from "#shared/models/tableEditor/file/column/Column";
import { dataSourceStatsSchema } from "#shared/models/tableEditor/file/datasource/DataSourceStats";
import { metadataSchema } from "#shared/models/tableEditor/file/datasource/Metadata";
import { rowSchema } from "#shared/models/tableEditor/file/datasource/Row";
import { z } from "zod";

export interface DataSource {
  columns: Column[];
  metadata: Metadata;
  rows: Row[];
  stats: DataSourceStats;
}

export const dataSourceSchema = z.object({
  columns: z.array(columnSchema),
  metadata: metadataSchema,
  rows: z.array(rowSchema),
  stats: dataSourceStatsSchema,
}) satisfies z.ZodType<ToData<DataSource>>;
